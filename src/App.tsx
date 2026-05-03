import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Wallet, Gamepad2, History, ShieldEllipsis, LogOut, Menu, X, Trophy, Activity, Headphones } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { WalletView } from './components/WalletView';
import { GamesView } from './components/GamesView';
import { AdminView } from './components/AdminView';
import { HistoryView } from './components/HistoryView';
import { AuthForm } from './components/AuthForm';

export default function App() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <AuthForm />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'ڈیش بورڈ', icon: Layout },
    { id: 'games', label: 'گیمز', icon: Gamepad2 },
    { id: 'wallet', label: 'والٹ', icon: Wallet },
    { id: 'history', label: 'تاریخ', icon: History },
  ];

  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldEllipsis });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <Trophy className="text-gold w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">RAJU GAME</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar / Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:relative z-50 w-64 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all overflow-y-auto
              ${isSidebarOpen ? 'left-0' : '-left-64 md:left-0'}`}
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="text-gold w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">RAJU GAME</span>
              </div>
              <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex flex-col items-start gap-1 px-4 py-3 rounded-2xl transition-all border
                    ${activeTab === item.id 
                      ? 'bg-gold/10 text-gold border-gold/20' 
                      : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-gold' : ''}`} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                </button>
              ))}
            </nav>

            <div className="p-4 mt-auto space-y-4">
              {/* Google Verification Badge in Sidebar */}
              <div className="px-4 py-3 rounded-2xl bg-gold/5 border border-gold/20 mb-2">
                <p className="text-[7px] text-gold/50 font-bold uppercase tracking-widest text-center mb-1">گوگل تصدیق شدہ</p>
                <p className="text-[8px] text-gray-400 break-all text-center leading-tight">m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw</p>
              </div>

              <div className="glass-card p-4 border-gold/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 px-2 bg-gold/20 text-gold text-[8px] font-black rounded-bl tracking-tighter">
                  {user.role === 'admin' ? 'ایڈمن' : 'وی آئی پی 1'}
                </div>
                <p className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-widest text-right">بیلنس</p>
                <div className="flex justify-end">
                  <p className="text-xl font-black text-gold tracking-tight italic tabular-nums">PKR {user.balance?.toLocaleString() ?? 0}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-end gap-2 text-[9px] text-gray-500 font-black uppercase tracking-tight text-right">
                  <span>محفوظ ادائیگیوں کی ضمانت</span>
                  <ShieldEllipsis className="w-3 h-3 text-green-500" />
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-end gap-4 px-4 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group"
                id="sidebar-logout-btn"
              >
                <div className="flex flex-col items-end leading-none text-right">
                  <span className="font-black uppercase text-[10px] tracking-widest">لاگ آؤٹ</span>
                </div>
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-180" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto pb-20">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'games' && <GamesView />}
          {activeTab === 'wallet' && <WalletView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'admin' && <AdminView />}
        </div>

        {/* Floating Support Button */}
        <motion.button
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.open('https://t.me/your_support_link', '_blank')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gold rounded-full shadow-[0_15px_30px_rgba(255,215,0,0.3)] flex items-center justify-center text-black z-[100] group overflow-hidden"
          id="floating-support-btn"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="absolute bottom-full right-0 mb-4 bg-black/90 text-white p-3 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl">
            <p className="text-[10px] font-black tracking-widest leading-tight">SUPPORT ONLINE (24/7)</p>
            <p className="text-[10px] font-bold text-gold">We are here to help!</p>
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative z-10"
          >
            <Headphones className="w-7 h-7" />
          </motion.div>
        </motion.button>
      </main>
    </div>
  );
}
