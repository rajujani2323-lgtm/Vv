import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, Users, ShieldAlert, ChevronRight, Activity, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user, token, updateBalance } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Refresh balance
    fetch('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(async res => {
      const text = await res.text();
      if (!res.ok) {
        if (res.status === 401) return null;
        console.error("API Error:", res.status, text.substring(0, 100));
        return null;
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    })
    .then(data => {
      if (data && typeof data.balance === 'number') {
        updateBalance(data.balance);
      }
    })
    .catch(err => {
      if (err instanceof TypeError || err.message === 'Failed to fetch') return;
      console.error("Balance refresh error:", err);
    });

    if (user?.role === 'admin') {
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch (e) { return null; }
      })
      .then(data => { if (data) setStats(data); })
      .catch(err => console.error("Admin stats error:", err));
    }
  }, []);

  const cards = [
    { label: 'Current Balance', value: `PKR ${user?.balance?.toLocaleString() ?? 0}`, icon: Wallet, color: 'text-gold' },
    { label: 'Platform Status', value: 'ONLINE', icon: Activity, color: 'text-blue-400' },
    { label: 'Verified VIP', value: 'ACTIVE', icon: ShieldAlert, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Official Verification Banner */}
      <div className="w-full bg-gold/10 border-2 border-gold/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gold/5 blur-[40px] -z-10 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-black">
             <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gold">گوگل آفیشل ویری فکیشن کوڈ</h2>
            <p className="text-xs text-gray-400 font-medium">یہ ویب سائٹ گوگل سرچ کنسول سے تصدیق شدہ ہے</p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
           <code className="text-sm md:text-lg font-mono text-white bg-black/60 px-6 py-2 rounded-xl border border-gold/40 shadow-[0_0_20px_rgba(255,215,0,0.1)] select-all cursor-pointer">
             m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw
           </code>
           <span className="text-[10px] text-gold/60 font-black uppercase tracking-tighter">Click to select and verify</span>
        </div>
      </div>

      {/* Live Winners Ticker */}
      <div className="bg-gold/5 border-y border-gold/20 overflow-hidden py-3 -mx-8">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-12 items-center">
          {[1,2,3,4,5].map(i => (
             <div key={i} className="flex items-center gap-3">
                <span className="text-gold font-bold text-xs">تازہ ترین جیت:</span>
                <span className="text-white font-black">User_{i}32</span>
                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">Wins: PKR {(Math.random() * 50000).toFixed(0)}</span>
             </div>
          ))}
          {[1,2,3,4,5].map(i => (
             <div key={i+10} className="flex items-center gap-3">
                <span className="text-gold font-bold text-xs">تازہ ترین جیت:</span>
                <span className="text-white font-black">Admin_Raju</span>
                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">Wins: PKR {(Math.random() * 90000).toFixed(0)}</span>
             </div>
          ))}
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            خوش آمدید، {user?.username} <span className="text-gold">✨</span>
          </h1>
          <p className="text-gray-400 font-medium italic">Account Status: <span className="text-green-400 font-bold">VIP ACTIVE</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="glass-card px-4 py-2 flex items-center gap-2 border-gold/20 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-[10px] font-black uppercase text-gold tracking-widest">LIVE SERVER</span>
           </div>
           {/* Verification Badge */}
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/5 border border-gold/20">
              <span className="text-[8px] font-bold text-gold/70">GOOGLE VERIFIED: m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {user?.role === 'admin' && stats && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="text-gold w-6 h-6" />
            <h2 className="text-xl font-bold">Admin Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 bg-gold/5 border-gold/10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="glass-card p-6 bg-gold/5 border-gold/10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Platform Liquidity</p>
              <p className="text-2xl font-bold">PKR {stats.totalBalance?.toLocaleString() ?? 0}</p>
            </div>
            <div className="glass-card p-6 bg-gold/5 border-gold/10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pending Deposits</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingDeposits}</p>
            </div>
            <div className="glass-card p-6 bg-gold/5 border-gold/10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pending Withdraws</p>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingWithdraws}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">حالیہ سرگرمی</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Played Crash Game</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-400">+PKR 450</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 border-gold/10 bg-gold/5">
          <h3 className="text-lg font-bold mb-4">پروموشنز</h3>
          <div className="aspect-video rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex flex-col items-center justify-center p-8 text-center">
            <Trophy className="w-12 h-12 text-gold mb-4" />
            <h4 className="text-xl font-bold mb-2">دوستوں کو بلائیں</h4>
            <p className="text-sm text-gray-400 mb-6">دوستوں کو انوائٹ کریں اور ان کے پہلے ڈپازٹ پر 10% بونس حاصل کریں۔</p>
            <button className="gold-gradient text-black px-6 py-2 rounded-lg font-bold text-sm">لنک کاپی کریں</button>
          </div>
        </div>
      </div>

      {/* Google Verification Display */}
      <div className="mt-12 pt-8 border-t border-white/5 text-center">
        <div className="inline-flex flex-col items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mb-1">Google Site Verification Content</p>
          <code className="text-[10px] text-gold/60 font-mono bg-black/40 px-3 py-1 rounded border border-gold/10">
            m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw
          </code>
          <p className="text-[10px] text-gray-500 mt-1">یہ ویب سائٹ گوگل سے تصدیق شدہ ہے</p>
        </div>
      </div>
    </div>
  );
}
