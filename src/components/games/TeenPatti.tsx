import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Club, Wallet, Trophy, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function TeenPatti() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handlePlay = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      // Update backend
      const res = await fetch('/api/game/teen-patti/play', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: Number(betAmount) })
      });
      const data = await res.json();
      updateBalance(data.balance);

      setResult({ userHandScore: data.userScore, dealerHandScore: data.dealerScore, won: data.won });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Teen Patti"
        rules={[
          "Teen Patti is a 3-card poker game played against the dealer.",
          "Players place an initial bet.",
          "The dealer and player are each dealt three cards.",
          "Standard Teen Patti/Poker hand rankings apply (Trail/Trio, Pure Sequence, Sequence, Color, Pair, High Card).",
          "The higher hand ranking wins the round."
        ]}
        bettingOptions={[
          "Set your blind bet amount before playing.",
          "Currently, the game focuses on the main bet outcome."
        ]}
        payouts={[
          "A winning hand pays approximately 1.9x to 2x your bet.",
          "Losing hands result in a loss of the bet amount."
        ]}
      />
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Club className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Teen Patti</h2>
              <p className="text-xs text-gray-500 font-mono">Traditional Indian Poker</p>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={handlePlay}
              disabled={loading || !betAmount || Number(betAmount) <= 0}
              className={`w-full py-4 rounded-xl font-black text-xl transition-all ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
            >
              {loading ? 'SHUFFLING...' : 'PLAY NOW'}
            </button>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                <Info className="w-3 h-3" /> Game Rules
              </div>
              <p className="text-[10px] text-gray-400">Place your blind bet. The system will deal 3 cards each. Highest hand wins the pot (2x payout).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-emerald-950/20 border-white/5 p-8">
          {/* Info Button */}
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="tp-info-btn"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
           <div className="flex flex-col items-center gap-12 w-full max-w-2xl relative z-10">
              {/* Dealer Hand */}
              <div className="space-y-4 flex flex-col items-center">
                <p className="text-xs font-black text-emerald-500/50 uppercase tracking-[0.2em]">Dealer Hand</p>
                <div className="flex gap-2">
                   {[1, 2, 3].map(i => (
                     <motion.div
                       key={`dealer-${i}`}
                       initial={{ y: -20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="w-20 h-28 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center font-black text-white/20 text-2xl"
                     >
                       {result ? '♣' : '?'}
                     </motion.div>
                   ))}
                </div>
              </div>

              <div className="w-full h-px bg-white/5 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#0a0a0a] text-gray-700 font-bold text-xs">VERSUS</div>
              </div>

              {/* User Hand */}
              <div className="space-y-4 flex flex-col items-center">
                 <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={`user-${i}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-24 h-36 rounded-xl flex flex-col items-center justify-center border-2 shadow-2xl relative transition-all ${result ? (result.won ? 'bg-white border-gold z-10 scale-110 shadow-gold/20' : 'bg-gray-200 border-gray-300 opacity-50') : 'bg-white border-white'}`}
                      >
                         <div className="text-black font-black text-3xl">A</div>
                         <div className="text-emerald-500 text-xl">♣</div>
                         <div className="absolute top-2 left-2 text-xs font-bold text-black">A♣</div>
                         <div className="absolute bottom-2 right-2 text-xs font-bold text-black rotate-180">A♣</div>
                      </motion.div>
                    ))}
                 </div>
                 <p className={`text-sm font-black uppercase tracking-[0.2em] transition-all ${result?.won ? 'text-gold' : 'text-emerald-500'}`}>Your Hand</p>
              </div>
           </div>

           {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <div className={`text-4xl font-black mb-1 ${result.won ? 'text-gold' : 'text-red-500'}`}>
                  {result.won ? 'TRAIL WIN!' : 'BET LOST'}
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase">Payout: {result.won ? '2x' : '0x'}</p>
              </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
