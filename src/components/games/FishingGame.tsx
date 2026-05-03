import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fish, Wallet, Zap, Anchor, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function FishingGame() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [caughtFish, setCaughtFish] = useState<any[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleCast = async () => {
    if (loading) return;
    if (Number(betAmount) > (user?.balance ?? 0)) return;

    setLoading(true);
    setCaughtFish([]);
    setTotalWin(0);

    try {
      // Update backend
      const res = await fetch('/api/game/fishing/cast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: Number(betAmount) })
      });
      const data = await res.json();
      updateBalance(data.balance);

      setCaughtFish(data.caught);
      setTotalWin(data.winAmount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Deep Sea Fishing"
        rules={[
          "Cast your line into the ocean to catch fish.",
          "Each cast costs your specified bet amount.",
          "Different rarity of fish carry different multipliers.",
          "Sometimes the line comes back empty - that's the risk of the sea!"
        ]}
        bettingOptions={[
          "Set your bet amount per cast.",
          "Higher bets yield higher absolute winnings for the same fish type."
        ]}
        payouts={[
          "Common Fish: 1.2x Multiplier.",
          "Rare Fish (Swordfish): 3x Multiplier.",
          "Golden Shark/Legendary: 10x Multiplier.",
          "Winnings = Bet Amount × Fish Multiplier."
        ]}
      />
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 bg-cyan-500/5 border-cyan-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Fish className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-400">Deep Sea Fishing</h2>
              <p className="text-xs text-gray-500 font-mono">Catch big, multiply bigger.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex justify-between mb-2">
                Bet Amount / Cast
                <span className="text-gold">PKR {user?.balance?.toLocaleString()}</span>
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={handleCast}
              disabled={loading || !betAmount || Number(betAmount) <= 0}
              className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]'}`}
            >
              {loading ? (
                <>
                  <Anchor className="w-5 h-5 animate-spin" />
                  REELING IN...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  CAST LINE
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-900/20 via-black to-cyan-900/10 border-white/5 p-8">
          {/* Info Button */}
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="fishing-info-btn"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="fishing-anim"
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
              >
                 <div className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-500/30 animate-[spin_5s_linear_infinite]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Anchor className="w-12 h-12 text-cyan-400 animate-bounce" />
                 </div>
              </motion.div>
            ) : caughtFish.length > 0 ? (
              <motion.div
                key="results"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {caughtFish.map((fish, idx) => (
                  <motion.div
                    key={fish.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="glass-card p-6 border-cyan-500/20 bg-cyan-500/5 text-center flex flex-col items-center"
                  >
                    <div className={`p-4 rounded-full mb-4 ${fish.type === 'Golden Shark' ? 'bg-gold/20 text-gold' : 'bg-white/5 text-cyan-200'}`}>
                      <Fish className="w-12 h-12" />
                    </div>
                    <p className="font-black text-lg mb-1">{fish.type}</p>
                    <p className="text-gold font-bold">{fish.multiplier}x Multiplier</p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="text-center opacity-30 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                 <Fish className="w-24 h-24 mb-4" />
                 <p className="font-black tracking-widest text-xl">EMPTY SEA</p>
                 <p className="text-sm mt-2">Cast your line into the deep</p>
              </motion.div>
            )}
          </AnimatePresence>

          {totalWin > 0 && !loading && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-12 text-center"
            >
              <h4 className="text-gold font-black text-5xl drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">PKR {totalWin.toLocaleString()}</h4>
              <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Total Catch Value</p>
            </motion.div>
          )}

          {totalWin === 0 && !loading && caughtFish.length === 0 && (
            <div className="absolute top-8 right-8 flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/10">
               <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
               Current Temp: 22°C | Depth: 450m
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
