import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, BookOpen, Target, Coins } from 'lucide-react';

interface GameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rules: string[];
  bettingOptions: string[];
  payouts: string[];
}

export function GameInfoModal({ isOpen, onClose, title, rules, bettingOptions, payouts }: GameInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-lg overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gold" />
                <h2 className="text-xl font-black tracking-tight">{title} Rules</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                id="close-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gold font-bold">
                  <BookOpen className="w-4 h-4" />
                  <h3 className="uppercase text-xs tracking-widest">How to Play</h3>
                </div>
                <ul className="space-y-2">
                  {rules.map((rule, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex gap-2">
                      <span className="text-gold font-bold">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Target className="w-4 h-4" />
                  <h3 className="uppercase text-xs tracking-widest">Betting Options</h3>
                </div>
                <ul className="space-y-2">
                  {bettingOptions.map((opt, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      {opt}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <Coins className="w-4 h-4" />
                  <h3 className="uppercase text-xs tracking-widest">Payouts</h3>
                </div>
                <ul className="space-y-2">
                  {payouts.map((pay, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex gap-2">
                      <span className="text-green-400 font-bold">•</span>
                      {pay}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5">
              <button
                onClick={onClose}
                className="w-full py-3 gold-gradient text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                id="modal-got-it-btn"
              >
                GOT IT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
