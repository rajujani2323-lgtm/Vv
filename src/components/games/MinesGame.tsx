import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bomb, Gem, Trophy, AlertCircle, RefreshCcw, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function MinesGame() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [grid, setGrid] = useState<any[]>(Array(25).fill(null)); // { type: 'gem' | 'bomb', isRevealed: boolean }
  const [revealedCount, setRevealedCount] = useState(0);
  const [minesAt, setMinesAt] = useState<number[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const calculateMultiplier = (revealed: number, mines: number) => {
    // Basic Mines Multiplier Formula: (25/25-mineCount) * (24/24-mineCount) ...
    let multiplier = 1.0;
    const total = 25;
    for (let i = 0; i < revealed; i++) {
      multiplier *= (total - i) / (total - mines - i);
    }
    // Apply house edge 2%
    return multiplier * 0.98;
  };

  const [serverSeedHash, setServerSeedHash] = useState('');

  const startGame = async () => {
    const amount = Number(betAmount);
    if (!amount || amount > (user?.balance || 0)) return;

    try {
      const res = await fetch('/api/game/mines/init', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: amount, mineCount, clientSeed: 'mines-' + Date.now() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      updateBalance(user!.balance - amount);
      setMinesAt(data.mines);
      setServerSeedHash(data.serverSeedHash);
      setGrid(Array(25).fill(null).map((_, i) => ({ 
        id: i, 
        type: data.mines.includes(i) ? 'bomb' : 'gem', 
        isRevealed: false 
      })));
      setGameState('playing');
      setRevealedCount(0);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const revealCell = (idx: number) => {
    if (gameState !== 'playing' || grid[idx].isRevealed) return;

    const newGrid = [...grid];
    newGrid[idx].isRevealed = true;
    setGrid(newGrid);

    if (newGrid[idx].type === 'bomb') {
      gameOver(false);
    } else {
      setRevealedCount(prev => prev + 1);
    }
  };

  const gameOver = async (didWin: boolean) => {
    setGameState('ended');
    // Reveal everything
    setGrid(prev => prev.map(cell => ({ ...cell, isRevealed: true })));
    
    if (didWin) {
      const winnings = Math.floor(Number(betAmount) * calculateMultiplier(revealedCount, mineCount));
      try {
        await fetch('/api/game/mines/cashout', {
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
            mines: minesAt
          })
        });
        updateBalance(user!.balance + winnings);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentMultiplier = calculateMultiplier(revealedCount, mineCount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Mines Game"
        rules={[
          "Select the number of mines you want on the board (1-24).",
          "Click on hidden tiles to reveal either a Gem or a Mine.",
          "Revealing a Gem increases your current multiplier.",
          "Revealing a Mine ends the game instantly and your bet is lost.",
          "You can cash out at any time after finding at least one Gem."
        ]}
        bettingOptions={[
          "Adjust the mine count before starting. More mines mean higher multipliers per Gem.",
          "Set your preferred bet amount for the round."
        ]}
        payouts={[
          "Payout = Bet Amount × Current Multiplier.",
          "The multiplier increases exponentially as you find more Gems.",
          "The maximum possible multiplier is reached when only mines are left on the board."
        ]}
      />
      <div className="lg:col-span-2 relative">
        <button 
          onClick={() => setIsInfoOpen(true)}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
          id="mines-info-btn"
        >
          <Info className="w-5 h-5" />
        </button>
        <div className="grid grid-cols-5 gap-3 max-w-[500px] mx-auto">
          {grid.map((cell, idx) => (
            <motion.button
              key={idx}
              whileHover={cell?.isRevealed ? {} : { scale: 1.05 }}
              whileTap={cell?.isRevealed ? {} : { scale: 0.95 }}
              onClick={() => revealCell(idx)}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all border-2
                ${!cell?.isRevealed 
                  ? 'bg-white/5 border-white/5 hover:border-gold/30 hover:bg-white/10' 
                  : cell.type === 'bomb' 
                    ? 'bg-red-500/20 border-red-500 text-red-500 bg-red-gradient' 
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-500'}`}
            >
              {cell?.isRevealed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {cell.type === 'bomb' ? <Bomb className="w-8 h-8" /> : <Gem className="w-8 h-8" />}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 border-gold/10">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">Bet Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={gameState === 'playing'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold/50 font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">Mines Count</label>
              <select
                value={mineCount}
                onChange={(e) => setMineCount(Number(e.target.value))}
                disabled={gameState === 'playing'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold/50 font-bold appearance-none"
              >
                {[1, 3, 5, 10, 24].map(v => (
                  <option key={v} value={v}>{v} Mines</option>
                ))}
              </select>
            </div>

            {gameState === 'playing' ? (
              <div className="space-y-3">
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-400/60 uppercase">Current Profit</p>
                  <p className="text-2xl font-black text-emerald-400">PKR {Math.floor(Number(betAmount) * currentMultiplier || 0).toLocaleString()}</p>
                  <p className="text-sm font-bold text-emerald-400/80">{currentMultiplier.toFixed(2)}x</p>
                </div>
                <button
                  onClick={() => gameOver(true)}
                  className="w-full py-4 rounded-xl font-black bg-emerald-500 text-black hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  CASH OUT
                </button>
              </div>
            ) : (
              <button
                onClick={startGame}
                disabled={!betAmount}
                className="w-full gold-gradient text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90"
              >
                <RefreshCcw className="w-5 h-5" />
                {gameState === 'ended' ? 'PLAY AGAIN' : 'START GAME'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-gold/5 border border-gold/10 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400 leading-relaxed">
            Provably Fair: Mine locations are encrypted and hashed before you play. Reveal hash available in Game History.
          </div>
        </div>
      </div>
    </div>
  );
}
