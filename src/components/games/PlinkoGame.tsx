import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid2x2, Wallet, Zap, Circle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function PlinkoGame() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const multipliers = [8, 4, 1.5, 0.5, 0.2, 0.5, 1.5, 4, 8];

  const handleDrop = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Update backend
      const res = await fetch('/api/game/plinko/play', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: Number(betAmount) })
      });
      const data = await res.json();
      updateBalance(data.balance);

      setHistory(prev => [{ mult: data.mult, win: data.winAmount, id: Date.now() }, ...prev.slice(0, 4)]);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Plinko"
        rules={[
          "Drop a ball from the top of the pyramid board.",
          "The ball will bounce randomly off pins as it falls.",
          "Where the ball lands at the bottom determines your multiplier.",
          "Outer slots have significantly higher payouts than center slots."
        ]}
        bettingOptions={[
          "Set your bet amount per ball drop.",
          "Each drop is a separate bet."
        ]}
        payouts={[
          "Center slots usually pay less than your bet (e.g., 0.2x, 0.5x).",
          "Edge slots pay high multipliers (up to 8x or more).",
          "Winnings = Bet Amount × Multiplier of the landing slot."
        ]}
      />
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 bg-pink-500/5 border-pink-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
              <Grid2x2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-pink-400">Pink Plinko</h2>
              <p className="text-xs text-gray-500 font-mono">Drop the ball, hit the jackpot.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex justify-between mb-2">
                Bet Amount
                <span className="text-gold">PKR {user?.balance?.toLocaleString()}</span>
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={handleDrop}
              disabled={loading || !betAmount || Number(betAmount) <= 0}
              className={`w-full py-4 rounded-xl font-black text-xl transition-all ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed text-sm' : 'bg-pink-500 text-white hover:bg-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.3)]'}`}
            >
              {loading ? 'BALL DROPPING...' : 'DROP BALL'}
            </button>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Recent Drops</p>
              <div className="flex gap-2">
                {history.map(item => (
                  <div key={item.id} className={`flex-1 text-center py-2 rounded-lg font-black text-xs ${item.mult >= 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.mult}x
                  </div>
                ))}
                {history.length === 0 && <div className="text-gray-600 text-[10px] italic">No drops yet</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-br from-pink-900/10 via-black to-indigo-900/10 border-white/5 p-8">
          {/* Info Button */}
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="plinko-info-btn"
          >
            <Info className="w-5 h-5" />
          </button>
           <div className="flex flex-col gap-4 items-center">
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <div key={row} className="flex gap-6">
                  {Array.from({ length: row + 2 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
                  ))}
                </div>
              ))}
           </div>

           <div className="relative w-full overflow-hidden py-8">
              <AnimatePresence>
                 {loading && (
                    <motion.div
                      initial={{ y: -200, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "bounceOut" }}
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                    >
                       <div className="w-6 h-6 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           <div className="flex gap-2 w-full max-w-2xl px-4">
              {multipliers.map((m, i) => (
                <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center font-black text-sm transition-all border-b-4 
                  ${m >= 8 ? 'bg-orange-500 border-orange-700 text-white' : 
                    m >= 4 ? 'bg-yellow-500 border-yellow-700 text-black' :
                    m >= 1.5 ? 'bg-green-500 border-green-700 text-white' :
                    'bg-white/10 border-white/20 text-gray-400'}`}>
                  {m}x
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
