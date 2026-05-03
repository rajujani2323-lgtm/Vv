import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, ArrowUpRight, ArrowDownLeft, Clock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function HistoryView() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wallet/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setHistory(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-400">Track all your deposits and withdrawals.</p>
      </header>

      <div className="glass-card p-6 flex items-center gap-4 border-white/5 bg-white/2" >
        <Search className="w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Filter transactions..." 
          className="bg-transparent flex-1 focus:outline-none text-sm text-white"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
           </div>
        ) : history.length > 0 ? (
          history.map((tx, idx) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-gold/20 transition-all border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl flex items-center justify-center
                  ${tx.type === 'deposit' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  {tx.type === 'deposit' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{tx.type === 'deposit' ? 'Deposit Request' : 'Withdrawal Request'}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <p className={`text-xl font-black ${tx.type === 'deposit' ? 'text-blue-400' : 'text-orange-400'}`}>
                  {tx.type === 'deposit' ? '+' : '-'} PKR {tx.amount?.toLocaleString() ?? 0}
                </p>
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border
                  ${tx.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {tx.status}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-600 glass-card border-dashed">
             <History className="w-12 h-12 mb-4 opacity-20" />
             <p>No transaction history found</p>
          </div>
        )}
      </div>
    </div>
  );
}
