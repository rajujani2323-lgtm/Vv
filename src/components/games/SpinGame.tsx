import React, { useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Disc, Wallet, Star, Trophy, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function SpinGame() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const controls = useAnimation();

  const segments = [
    { label: '0x', color: 'bg-gray-800', mult: 0 },
    { label: '2x', color: 'bg-emerald-500', mult: 2 },
    { label: '0x', color: 'bg-gray-800', mult: 0 },
    { label: '5x', color: 'bg-gold', mult: 5 },
    { label: '0x', color: 'bg-gray-800', mult: 0 },
    { label: '10x', color: 'bg-purple-600', mult: 10 },
    { label: '0x', color: 'bg-gray-800', mult: 0 },
    { label: '2x', color: 'bg-emerald-500', mult: 2 },
  ];

  const handleSpin = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    // Update backend
    const res = await fetch('/api/game/spin/play', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ betAmount: Number(betAmount) })
    });
    const data = await res.json();
    
    const rotation = 360 * 5 + (data.targetIdx * (360 / segments.length));
    
    await controls.start({
      rotate: rotation,
      transition: { duration: 4, ease: "circOut" }
    });

    updateBalance(data.balance);
    setResult({ mult: data.mult, win: data.winAmount });
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Wheel of Fortune"
        rules={[
          "Spin the wheel to win various multipliers.",
          "The wheel is divided into several segments.",
          "Wait for the wheel to stop; the segment indicated by the pointer is your result.",
          "Each color represents a different multiplier value."
        ]}
        bettingOptions={[
          "Set your bet amount for the spin.",
          "Each spin costs the specified bet amount."
        ]}
        payouts={[
          "Multiplier segments vary: 0x (Loss), 2x, 5x, 10x.",
          "Winnings = Bet Amount × Multiplier of the segment."
        ]}
      />
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-400">Wheel of Fortune</h2>
              <p className="text-xs text-gray-500 font-mono">Spin to win epic multipliers.</p>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={loading || !betAmount || Number(betAmount) <= 0}
              className={`w-full py-4 rounded-xl font-black text-xl transition-all ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]'}`}
            >
              {loading ? 'SPINNING...' : 'SPIN WHEEL'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col items-center justify-center p-8 bg-purple-950/10 rounded-3xl relative overflow-hidden border border-white/5">
         <button 
          onClick={() => setIsInfoOpen(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
          id="spin-info-btn"
        >
          <Info className="w-5 h-5" />
        </button>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
               <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-500" />
            </div>
         </div>

         <motion.div
           animate={controls}
           className="relative w-80 h-80 rounded-full border-8 border-white/10 overflow-hidden shadow-2xl"
         >
            {segments.map((s, i) => (
              <div
                key={i}
                className={`absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-center ${s.color}`}
                style={{ transform: `rotate(${i * (360 / segments.length)}deg) skewY(-45deg)` }}
              >
                 <span className="font-black text-xl absolute -left-4 top-1/2 -translate-y-1/2 rotate-45 skewY(45deg)">{s.label}</span>
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
         </motion.div>

         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Star className="w-full h-full text-white" />
         </div>

         {result && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
               <h3 className={`text-4xl font-black mb-1 ${result.mult > 0 ? 'text-gold' : 'text-gray-500'}`}>
                 {result.mult > 0 ? `+PKR ${result.win.toLocaleString()}` : 'GOOD LUCK NEXT TIME!'}
               </h3>
               {result.mult > 0 && <p className="text-gold font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <Trophy className="w-4 h-4" /> {result.mult}x MULTIPLIER!
               </p>}
            </motion.div>
         )}
      </div>
    </div>
  );
}
