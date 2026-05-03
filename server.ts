import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";

import authRoutes from "./server/routes/auth.ts";
import walletRoutes from "./server/routes/wallet.ts";
import adminRoutes from "./server/routes/admin.ts";
import gameRoutes from "./server/routes/game.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI && (MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://"))) {
    console.log("Attempting to connect to MongoDB...");
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Faster timeout
    })
      .then(() => console.log("✅ Connected to MongoDB"))
      .catch(err => {
        console.warn("⚠️ MongoDB offline. Running in Mock Mode (Data will not persist).");
      });
  } else {
    console.log("ℹ️ No MONGODB_URI found (or invalid format). Active: Mock Mode.");
  }

  // Admin Game Settings
  app.set('gameSettings', {
    globalWinRate: 1.0,
    crashLimit: 10.0,
    minesDifficulty: 'normal', // easy, normal, hard
    dragonTigerMode: 'random', // random, force_loss, force_win
    teenPattiMode: 'random',
    fishingLuck: 1.0,
    plinkoMode: 'random',
    spinMode: 'random'
  });

  // Crash Game State
  const crashState = {
    multiplier: 1.0,
    status: "waiting" as "waiting" | "running" | "crashed",
    nextIn: 5,
    serverSeed: crypto.randomBytes(32).toString('hex'),
    bets: [] as { userId: string, amount: number, cashedOut: boolean, multiplier?: number }[]
  };

  const startCrashGame = () => {
    crashState.status = "running";
    crashState.multiplier = 1.0;
    crashState.bets = [];
    
    // Provably fair crash point
    const h = parseInt(crypto.createHmac('sha256', crashState.serverSeed).update("global-client-seed").digest('hex').substring(0, 13), 16);
    const e = Math.pow(2, 52);
    const crashPoint = Math.max(1, Math.floor((100 * e - h) / (e - h)) / 100);

    const interval = setInterval(() => {
      if (crashState.multiplier >= crashPoint || (crashState as any).forceCrash) {
        crashState.status = "crashed";
        (crashState as any).forceCrash = false;
        io.emit("crash_update", { multiplier: crashState.multiplier, status: crashState.status });
        clearInterval(interval);
        
        setTimeout(() => {
          crashState.status = "waiting";
          crashState.serverSeed = crypto.randomBytes(32).toString('hex');
          crashState.nextIn = 5;
          io.emit("crash_update", { multiplier: 1.0, status: crashState.status, nextIn: 5 });
          
          const countdown = setInterval(() => {
            crashState.nextIn--;
            if (crashState.nextIn <= 0) {
              clearInterval(countdown);
              startCrashGame();
            } else {
              io.emit("crash_update", { multiplier: 1.0, status: crashState.status, nextIn: crashState.nextIn });
            }
          }, 1000);
        }, 3000);
      } else {
        crashState.multiplier += 0.01 + (crashState.multiplier * 0.005);
        io.emit("crash_update", { multiplier: crashState.multiplier, status: crashState.status });
      }
    }, 100);
  };

  setTimeout(startCrashGame, 5000);

  // Expose crashState for routes if needed
  app.set('crashState', crashState);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.emit("crash_update", { 
      multiplier: crashState.multiplier, 
      status: crashState.status, 
      nextIn: crashState.nextIn 
    });

    socket.on("join_game", (gameId) => {
      socket.join(gameId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/game", gameRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
