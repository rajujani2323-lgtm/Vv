import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CircleDot, TrendingUp, AlertCircle, RefreshCcw, Wallet, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GameInfoModal } from '../GameInfoModal';

export function DiceGame() {
  const { user, token, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('100');
  const [prediction, setPrediction] = useState(50);
  const [rollType, setRollType] = useState<'over' | 'under'>('over');
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const calculateMultiplier = () => {
    const chance = rollType === 'over' ? (100 - prediction) : prediction;
    if (chance === 0) return 0;
    return (98 / chance); // 2% house edge
  };

  const rollDice = async () => {
    const amount = Number(betAmount);
    if (!amount || amount > (user?.balance || 0)) return;

    setIsRolling(true);
    setResult(null);
    updateBalance(user!.balance - amount);

    try {
      const res = await fetch('/api/game/dice/play', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          betAmount: amount, 
          target: prediction, 
          condition: rollType,
          clientSeed: 'dice-' + Date.now()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Fake delay for suspense
      setTimeout(() => {
        setLastRoll(data.roll);
        if (data.won) {
          setResult('win');
          updateBalance(data.balance);
        } else {
          setResult('loss');
        }
        setIsRolling(false);
      }, 800);
    } catch (err: any) {
      alert(err.message);
      setIsRolling(false);
    }
  };

  const multiplier = calculateMultiplier();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <GameInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Dice Game"
        rules={[
          "Choose a target number between 2 and 98.",
          "Predict whether the roll will be 'Over' or 'Under' that target.",
          "The dice will roll a random number between 0.00 and 100.00.",
          "If your prediction is correct, you win based on the current multiplier."
        ]}
        bettingOptions={[
          "Adjust the slider to change the roll target.",
          "Switch between Over and Under modes.",
          "Multiplier and Win Chance update automatically based on your target."
        ]}
        payouts={[
          "Payout = Bet Amount × Multiplier.",
          "Multiplier is calculated as 98 / Win Chance (includes 2% house edge).",
          "Higher risk targets yield significantly higher multipliers."
        ]}
      />
      <div className="lg:col-span-2 space-y-8">
        <div className="glass-card h-[300px] flex flex-col items-center justify-center relative bg-black/20">
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gold transition-all z-20"
            id="dice-info-btn"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-4 p-2 bg-white/5 rounded border border-white/10 text-[10px] text-gray-500 font-mono">
            {isRolling ? 'GENERATING ROLL...' : lastRoll ? `ROLL: ${lastRoll.toFixed(2)}` : 'READY TO ROLL'}
          </div>

          <div className="flex items-center gap-4">
             <motion.div
               animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
               transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
               className={`w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-black border-4 
                 ${result === 'win' ? 'border-green-500 bg-green-500/10 text-green-500' : 
                   result === 'loss' ? 'border-red-500 bg-red-500/10 text-red-500' : 
                   'border-gold bg-gold/10 text-gold'}`}
             >
               {lastRoll ? lastRoll.toFixed(0) : '??'}
             </motion.div>
          </div>

          <div className="mt-12 w-full px-12 relative h-12">
            <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
               <div 
                 className={`h-full transition-all duration-300 ${rollType === 'over' ? 'bg-red-500/20' : 'bg-green-500/40'}`} 
                 style={{ width: `${prediction}%` }}
               />
               <div 
                 className={`h-full absolute top-0 right-0 transition-all duration-300 ${rollType === 'over' ? 'bg-green-500/40' : 'bg-red-500/20'}`} 
                 style={{ width: `${100 - prediction}%` }}
               />
            </div>
            {lastRoll !== null && (
              <motion.div 
                initial={{ left: '0%' }}
                animate={{ left: `${lastRoll}%` }}
                className="absolute top-0 w-1 h-12 bg-white gold-glow z-10 transition-all"
              />
            )}
          </div>
          <div className="w-full px-12 flex justify-between text-xs text-gray-500 mt-2 font-mono">
             <span>0</span>
             <span>25</span>
             <span>50</span>
             <span>75</span>
             <span>100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Win Chance</p>
            <p className="text-xl font-bold">{rollType === 'over' ? (100 - prediction).toFixed(2) : prediction.toFixed(2)}%</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Multiplier</p>
            <p className="text-xl font-bold text-gold">{multiplier.toFixed(4)}x</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 border-gold/10">
           <div className="space-y-6">
             <div>
              <label className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">Bet Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isRolling}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold/50 font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                 <label className="text-xs text-gray-500 uppercase tracking-wider">Prediction: {rollType === 'over' ? 'Over' : 'Under'} {prediction}</label>
                 <button 
                  onClick={() => setRollType(rollType === 'over' ? 'under' : 'over')}
                  className="text-xs text-gold underline font-bold"
                 >
                   Switch to {rollType === 'over' ? 'Under' : 'Over'}
                 </button>
              </div>
              <input
                type="range"
                min="2"
                max="98"
                value={prediction}
                onChange={(e) => setPrediction(Number(e.target.value))}
                disabled={isRolling}
                className="w-full accent-gold bg-white/5 h-2 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            <button
               onClick={rollDice}
               disabled={isRolling || !betAmount}
               className="w-full gold-gradient text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:grayscale transition-all text-xl"
            >
               {isRolling ? <RefreshCcw className="w-6 h-6 animate-spin" /> : 'ROLL DICE'}
            </button>
           </div>
        </div>

        <div className="bg-gold/5 border border-gold/10 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400">
            Provably Fair: Each roll uses a deterministic hash from a server-side secret revealed after the session.
          </div>
        </div>
      </div>
    </div>
  );
}
