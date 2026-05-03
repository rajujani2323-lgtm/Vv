import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Swords, Wallet, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function DragonTiger() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [betSide, setBetSide] = useState<'dragon' | 'tiger'>('dragon');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handlePlay = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      // Logic for Dragon vs Tiger (Highest card wins)
      // Dragon card 1-13, Tiger card 1-13
      const dragonCard = Math.floor(Math.random() * 13) + 1;
      const tigerCard = Math.floor(Math.random() * 13) + 1;
      
      let winner: 'dragon' | 'tiger' | 'tie' = 'dragon';
      if (tigerCard > dragonCard) winner = 'tiger';
      else if (tigerCard === dragonCard) winner = 'tie';

      const won = betSide === winner;
      const winAmount = won ? Number(betAmount) * 2 : 0;

      // Update backend
      const res = await fetch('/api/game/dragon-tiger/play', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount: Number(betAmount), betSide })
      });
      const data = await res.json();
      updateBalance(data.balance);

      setResult({ 
        dragonCard: data.dragonCard, 
        tigerCard: data.tigerCard, 
        winner: data.winner, 
        won: data.won 
      });
    } finally {
      setLoading(false);
    }
  };

  const cardName = (val: number) => {
    if (val === 1) return 'A';
    if (val === 11) return 'J';
    if (val === 12) return 'Q';
    if (val === 13) return 'K';
    return val.toString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Dragon vs Tiger"
        rules={[
          "Bet on which side will receive a higher card value.",
          "One card is dealt to the Dragon side and one to the Tiger side.",
          "Cards are ranked as: K (High), Q, J, 10... 2, A (Low).",
          "If both sides receive the same card value, it's a Tie."
        ]}
        bettingOptions={[
          "Bet on 'Dragon' to win.",
          "Bet on 'Tiger' to win.",
          "Note: Tie bets aren't currently separate but result in a push/loss depending on your chosen side."
        ]}
        payouts={[
          "Winning side: 1:1 payout (2x your bet).",
          "Tie: Currently results in a loss if you bet on a specific side."
        ]}
      />
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 bg-red-500/5 border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Dragon vs Tiger</h2>
              <p className="text-xs text-gray-500 font-mono">Provably Fair 2.0</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex justify-between mb-2">
                Bet Amount
                <span className="text-gold">PKR {user?.balance?.toLocaleString()}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 transition-all font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setBetAmount(String(Number(betAmount) / 2))} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">1/2</button>
                  <button onClick={() => setBetAmount(String(Number(betAmount) * 2))} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">2x</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBetSide('dragon')}
                className={`py-4 rounded-xl border-2 transition-all font-black text-lg ${betSide === 'dragon' ? 'bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                DRAGON
              </button>
              <button
                onClick={() => setBetSide('tiger')}
                className={`py-4 rounded-xl border-2 transition-all font-black text-lg ${betSide === 'tiger' ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                TIGER
              </button>
            </div>

            <button
              onClick={handlePlay}
              disabled={loading || !betAmount || Number(betAmount) <= 0}
              className={`w-full py-4 rounded-xl font-black text-xl transition-all ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {loading ? 'WAITING...' : 'PLACE BET'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-900/10 via-black to-blue-900/10 border-white/5 p-8">
          {/* Info Button */}
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="dt-info-btn"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
             <div className="w-[500px] h-[500px] border-[50px] border-white rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-12 w-full max-w-2xl relative z-10">
            <div className="space-y-6 flex flex-col items-center">
              <h3 className="text-gray-500 uppercase font-black text-sm tracking-widest">DRAGON</h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={result?.dragonCard}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  className={`w-40 h-56 rounded-2xl flex flex-col items-center justify-center border-4 shadow-2xl bg-white text-black font-black text-4xl relative ${result?.winner === 'dragon' ? 'border-red-500 ring-4 ring-red-500/20' : 'border-gray-200'}`}
                >
                   {result ? cardName(result.dragonCard) : '?'}
                   <div className="absolute top-2 left-2 text-xl font-bold">♥</div>
                   <div className="absolute bottom-2 right-2 text-xl font-bold rotate-180">♥</div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-6 flex flex-col items-center">
              <h3 className="text-gray-500 uppercase font-black text-sm tracking-widest">TIGER</h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={result?.tigerCard}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  className={`w-40 h-56 rounded-2xl flex flex-col items-center justify-center border-4 shadow-2xl bg-white text-black font-black text-4xl relative ${result?.winner === 'tiger' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200'}`}
                >
                   {result ? cardName(result.tigerCard) : '?'}
                   <div className="absolute top-2 left-2 text-xl font-bold text-blue-500">♠</div>
                   <div className="absolute bottom-2 right-2 text-xl font-bold rotate-180 text-blue-500">♠</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
              <p className={`text-4xl font-black mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? 'YOU WON!' : 'YOU LOST'}
              </p>
              <p className="text-gray-400 uppercase tracking-widest font-bold">
                Winner: {result.winner.toUpperCase()}
              </p>
            </motion.div>
          )}

          {!result && !loading && (
            <p className="mt-12 text-gray-500 animate-pulse font-bold">PLACE YOUR BET TO START</p>
          )}

          {loading && (
            <div className="mt-12 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
