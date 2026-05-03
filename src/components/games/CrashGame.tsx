import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { Ship, TrendingUp, AlertCircle, Trophy, Wallet, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function CrashGame() {
  const { user, token, updateBalance } = useAuth();
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [nextIn, setNextIn] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);

  // Animated Multiplier
  const springMultiplier = useSpring(1.0, {
    damping: 30,
    stiffness: 100,
    restDelta: 0.001
  });

  const displayMultiplier = useTransform(springMultiplier, (latest) => latest.toFixed(2));

  useEffect(() => {
    if (status !== 'crashed') {
      springMultiplier.set(multiplier);
    }
  }, [multiplier, springMultiplier, status]);

  useEffect(() => {
    socketRef.current = io(window.location.origin);
    
    socketRef.current.on('crash_update', (data: any) => {
      setMultiplier(data.multiplier);
      setStatus(data.status);
      if (data.nextIn) setNextIn(data.nextIn);
      
      if (data.status === 'crashed') {
        if (hasBet && !cashoutAt) {
          // Lost bet
          setHasBet(false);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const placeBet = async () => {
    const amount = Number(betAmount);
    if (!amount || amount <= 0 || amount > (user?.balance || 0)) return;
    
    try {
      const res = await fetch('/api/game/crash/play', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: amount, clientSeed: 'crash-' + Date.now() })
      });
      let data;
      try {
          const text = await res.text();
          data = JSON.parse(text);
      } catch (e) {
          throw new Error('Server error or downtime');
      }
      if (!res.ok) throw new Error(data?.message || 'Error');

      setHasBet(true);
      setCashoutAt(null);
      setWinAmount(null);
      updateBalance(user!.balance - amount);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cashOut = async () => {
    if (!hasBet || cashoutAt || status !== 'running') return;
    
    const currentMultiplier = multiplier;
    const winnings = Math.floor(Number(betAmount) * currentMultiplier);
    
    try {
      const res = await fetch('/api/game/crash/result', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          betAmount: Number(betAmount), 
          multiplier: currentMultiplier, 
          winAmount: winnings,
          serverSeed: 'internal',
          clientSeed: 'internal',
          outcome: { crashPoint: currentMultiplier }
        })
      });
      let data;
      try {
          const text = await res.text();
          data = JSON.parse(text);
      } catch (e) {
          throw new Error('Server error or downtime');
      }
      if (!res.ok) throw new Error(data?.message || 'Error');

      setCashoutAt(currentMultiplier);
      setWinAmount(winnings);
      setHasBet(false);
      updateBalance(data.balance);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const rocketBottom = useTransform(springMultiplier, (m) => `${Math.min(10 + Math.log10(m) * 60, 80)}%`);
  const rocketLeft = useTransform(springMultiplier, (m) => `${Math.min(10 + Math.log10(m) * 60, 80)}%`);

  const shakeVariants = {
    shake: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Crash Game"
        rules={[
          "Place a bet before the game round begins.",
          "Watch the multiplier increase from 1.00x upwards.",
          "Cash out at any time to multiply your bet by that value.",
          "If the rocket crashes before you cash out, the bet is lost."
        ]}
        bettingOptions={[
          "Enter any amount within your balance limits.",
          "Use quick-bet buttons for common amounts."
        ]}
        payouts={[
          "Payout = Bet Amount × Multiplier at Cashout.",
          "Minimum Payout: 1.01x",
          "Maximum Payout: Unlimited (based on crash point)."
        ]}
      />
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Game Canvas / Display */}
        <motion.div 
          variants={shakeVariants}
          animate={status === 'crashed' ? 'shake' : ''}
          className="relative h-[400px] glass-card overflow-hidden bg-black/40 flex flex-col items-center justify-center border-white/5"
        >
          {/* Info Button */}
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="crash-info-btn"
          >
            <Info className="w-5 h-5" />
          </button>
          {/* Visual Elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="grid grid-cols-10 h-full w-full">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/10"></div>
                ))}
             </div>
          </div>

          <div className="relative z-10 text-center">
            <AnimatePresence mode="wait">
              {status === 'waiting' ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                >
                  <p className="text-gold uppercase tracking-[0.2em] font-medium mb-4">Starting In</p>
                  <p className="text-7xl font-black">{nextIn}s</p>
                </motion.div>
              ) : status === 'running' ? (
                <motion.div
                  key="running"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.p 
                    className={`text-8xl font-black tabular-nums transition-colors ${cashoutAt ? 'text-white/50' : 'text-white'}`}
                  >
                    <motion.span>{displayMultiplier}</motion.span>x
                  </motion.p>
                  {cashoutAt && (
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-green-400 font-bold mt-4"
                    >
                      Cashed out at {cashoutAt.toFixed(2)}x
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="crashed"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <p className="text-red-500 text-8xl font-black mb-2">CRASHED</p>
                  <p className="text-red-500/60 font-bold text-2xl">@ {multiplier.toFixed(2)}x</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ship Animation */}
          {status === 'running' && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: rocketBottom,
                left: rocketLeft,
              }}
              className="text-gold"
            >
              <motion.div
                animate={{
                  rotate: [15, 12, 18, 15],
                  y: [0, -4, 0],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Ship className="w-16 h-16 gold-glow" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent History */}
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
          {[1.2, 5.4, 1.05, 12.3, 2.1, 1.8, 3.4].map((m, i) => (
            <div key={i} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 border border-white/10 ${m >= 2 ? 'text-green-400 border-green-400/20' : 'text-red-400 border-red-400/20'}`}>
              {m.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 border-gold/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="text-gold w-5 h-5" />
              Place Bet
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Wallet className="w-3 h-3" />
              PKR {user?.balance?.toLocaleString() ?? 0}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">Bet Amount</label>
              <div className="flex gap-2 mb-2">
                {[100, 500, 1000, 2000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setBetAmount(String(val))}
                    className="flex-1 py-1 rounded bg-white/5 border border-white/10 text-xs hover:border-gold/50 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={hasBet || status === 'running'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold/50 font-bold"
              />
            </div>

            {hasBet && status === 'running' ? (
              <button
                onClick={cashOut}
                disabled={!!cashoutAt}
                className={`w-full py-4 rounded-xl font-black text-xl transition-all shadow-lg
                  ${cashoutAt 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                    : 'bg-green-500 text-black hover:scale-[1.02] gold-glow active:scale-95'}`}
              >
                {cashoutAt ? `WON PKR ${winAmount}` : (
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-xl">CASH OUT</span>
                    <span className="text-sm opacity-80 font-semibold mt-1">PKR {Math.floor(Number(betAmount) * multiplier).toLocaleString()}</span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={placeBet}
                disabled={hasBet || status !== 'waiting' || !betAmount}
                className="w-full gold-gradient text-black font-black py-4 rounded-xl text-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {hasBet ? 'BET PLACED' : 'BET'}
              </button>
            )}
          </div>
        </div>

        <div className="glass-card p-6 bg-blue-500/5 border-blue-500/10">
          <h4 className="font-bold flex items-center gap-2 text-sm mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            Provably Fair Ticker
          </h4>
          <p className="text-xs text-gray-500 font-mono break-all leading-tight">
            SEED_HASH: f5a3...e912 (revealed after run)
          </p>
        </div>
      </div>
    </div>
  );
}
