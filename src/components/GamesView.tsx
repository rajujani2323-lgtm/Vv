import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, TrendingUp, Grid3x3, CircleDot, PlayCircle, ShieldCheck, Swords, Club, Fish, Grid2x2, Disc } from 'lucide-react';
import { CrashGame } from './games/CrashGame';
import { MinesGame } from './games/MinesGame';
import { DiceGame } from './games/DiceGame';
import { DragonTiger } from './games/DragonTiger';
import { TeenPatti } from './games/TeenPatti';
import { FishingGame } from './games/FishingGame';
import { PlinkoGame } from './games/PlinkoGame';
import { SpinGame } from './games/SpinGame';

export function GamesView() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { 
      id: 'crash', 
      title: 'Crash Game', 
      desc: 'Predict when the rocket will crash. High risk, high reward!',
      icon: TrendingUp,
      bg: 'from-rose-950/20 border-rose-500/20',
      logoColor: 'text-rose-500',
      badge: 'POPULAR',
      category: 'INSTANT'
    },
    { 
      id: 'mines', 
      title: 'Mines', 
      desc: 'Classic minesweeper style betting. Dodge bombs, win big.',
      icon: Grid3x3,
      bg: 'from-emerald-950/20 border-emerald-500/20',
      logoColor: 'text-emerald-500',
      badge: 'HOT',
      category: 'SKILL'
    },
    { 
      id: 'dice', 
      title: 'Dice Roll', 
      desc: 'Provably fair dice rolling with custom win probabilities.',
      icon: CircleDot,
      bg: 'from-orange-950/20 border-orange-500/20',
      logoColor: 'text-orange-500',
      category: 'FAIR'
    },
    { 
      id: 'dragon-tiger', 
      title: 'Dragon Tiger', 
      desc: 'Dragon vs Tiger card battle. Fast paced high-low action.',
      icon: Swords,
      bg: 'from-indigo-950/20 border-indigo-500/20',
      logoColor: 'text-indigo-500',
      badge: 'NEW',
      category: 'CARDS'
    },
    { 
      id: 'teen-patti', 
      title: 'Teen Patti', 
      desc: 'Traditional Indian card game. Show your skills and luck.',
      icon: Club,
      bg: 'from-green-950/20 border-green-500/20',
      logoColor: 'text-green-500',
      category: 'CARDS'
    },
    { 
      id: 'fish', 
      title: 'Deep Fishing', 
      desc: 'Arcade style fishing game. Catch multipliers in the deep.',
      icon: Fish,
      bg: 'from-cyan-950/20 border-cyan-500/20',
      logoColor: 'text-cyan-400',
      category: 'ARCADE'
    },
    { 
      id: 'plinko', 
      title: 'Pink Plinko', 
      desc: 'Drop the ball through the pegs. Everyone wins something!',
      icon: Grid2x2,
      bg: 'from-pink-950/20 border-pink-500/20',
      logoColor: 'text-pink-500',
      category: 'INSTANT'
    },
    { 
      id: 'spin', 
      title: 'Wheel Spin', 
      desc: 'Spin the luxury wheel of fortune for massive multipliers.',
      icon: Disc,
      bg: 'from-purple-950/20 border-purple-500/20',
      logoColor: 'text-purple-500',
      badge: 'JACKPOT',
      category: 'WHEEL'
    }
  ];

  const categories = ['ALL', 'INSTANT', 'SKILL', 'CARDS', 'ARCADE'];
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredGames = activeCategory === 'ALL' 
    ? games 
    : games.filter(g => g.category === activeCategory);

  if (activeGame) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveGame(null)}
          className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 bg-white/5 px-4 py-2 rounded-xl transition-all"
        >
          <Gamepad2 className="w-5 h-5" /> Back to Lobby
        </button>
        {activeGame === 'crash' && <CrashGame />}
        {activeGame === 'mines' && <MinesGame />}
        {activeGame === 'dice' && <DiceGame />}
        {activeGame === 'dragon-tiger' && <DragonTiger />}
        {activeGame === 'teen-patti' && <TeenPatti />}
        {activeGame === 'fish' && <FishingGame />}
        {activeGame === 'plinko' && <PlinkoGame />}
        {activeGame === 'spin' && <SpinGame />}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter italic">GAME LOBBY</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">3,248 Highly Active Players</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {categories.map(cat => (
             <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border ${
                  activeCategory === cat 
                  ? 'gold-gradient border-transparent' 
                  : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                }`}
             >
                {cat}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, idx) => (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => setActiveGame(game.id)}
              className={`group relative overflow-hidden glass-card h-[420px] cursor-pointer transition-all flex flex-col bg-gradient-to-b ${game.bg} to-black/60 border-white/5 hover:border-gold/30 shadow-none hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}
            >
              {/* Badge */}
              {game.badge && (
                <div className="absolute top-4 left-4 z-30">
                  <span className={`text-[9px] font-black tracking-tighter px-2.5 py-1 rounded-lg bg-gold text-black shadow-lg shadow-gold/20`}>
                    {game.badge}
                  </span>
                </div>
              )}

              {/* Logo Area */}
              <div className="h-56 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-20"
                >
                  <game.icon className={`w-32 h-32 ${game.logoColor} drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]`} />
                </motion.div>
              </div>
              
              <div className="p-8 pt-0 flex-1 flex flex-col items-center text-center">
                <div className="text-[9px] font-black text-gold/40 tracking-[0.2em] mb-3 uppercase">{game.category}</div>
                <h2 className="text-2xl font-black mb-3 tracking-tighter group-hover:text-gold transition-colors">{game.title}</h2>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 font-medium mb-8 p-1">{game.desc}</p>
                
                <div className="mt-auto w-full">
                  <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white/5 border border-white/5 group-hover:gold-gradient group-hover:border-transparent font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                    <PlayCircle className="w-4 h-4" />
                    Launch Table
                  </button>
                </div>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 w-[0%] group-hover:w-full h-0.5 bg-gold transition-all duration-500" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 glass-card p-8 bg-blue-500/[0.03] border-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <ShieldCheck className="w-24 h-24 text-blue-400" />
        </div>
        <h3 className="font-black text-xl flex items-center gap-2 mb-4 tracking-tight">
          <ShieldCheck className="text-blue-400 w-6 h-6" />
          FAIR PLAY & SECURITY
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-3xl font-medium">
          Our platform utilizes industry-standard cryptographic algorithms to ensure absolute transparency. 
          Every game outcome is pre-determined by a unique combination of server and client seeds. 
          You can verify the integrity of any round using the hash provided in your game history. 
          No manipulation is possible — your trust is our priority.
        </p>
      </div>
    </div>
  );
}
