import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin ? { username, password } : { username, email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      
      authLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Top Banner Verification */}
      <div className="absolute top-0 left-0 w-full bg-gold/10 border-b border-gold/20 py-2 px-4 flex flex-wrap justify-center items-center gap-2 z-50">
        <span className="text-[9px] text-gold font-bold uppercase tracking-widest text-center">گوگل سے تصدیق شدہ آفیشل ویب سائٹ</span>
        <code className="text-[10px] text-white/90 font-mono bg-black/40 px-2 py-0.5 rounded border border-gold/20 select-all">
          m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw
        </code>
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-10 border-white/5 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center mb-6 border border-gold/20 shadow-[0_0_30px_rgba(255,215,0,0.1)]"
          >
            <Trophy className="text-gold w-10 h-10 gold-glow" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">راجو گیم وی آئی پی</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 bg-gold/50" />
            <p className="text-gold/60 text-[10px] uppercase font-black tracking-[0.2em]">پریمیم گیمنگ پورٹل</p>
            <div className="h-[1px] w-4 bg-gold/50" />
          </div>
        </div>

        {/* Google Verification Display (Visible on Home/Auth screen) */}
        <div className="mb-8 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-[8px] text-gray-600 font-mono tracking-widest uppercase mb-1">Google Verification</p>
          <code className="text-[10px] text-gold/40 font-mono">m9-uZZtlYfYz_IXFps9VRdMQ9Ar59z_cgH7v_W8hCiw</code>
          <p className="text-[9px] text-gray-500 mt-1">گوگل سے تصدیق شدہ آفیشل ویب سائٹ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">یوزر آئی ڈی</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="یوزرنیم / فون نمبر"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-gray-700 text-right"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ای میل</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-gold transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ای میل ایڈریس"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-gray-700 text-right"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">پاس ورڈ</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-gold transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="آپ کا پاس ورڈ"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-gray-700 text-right"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-[10px] font-bold bg-red-500/5 p-4 rounded-2xl border border-red-500/10 flex items-center justify-end gap-2"
            >
              {error}
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 gold-gradient text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(255,215,0,0.2)]"
            id="auth-submit-btn"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="uppercase tracking-[0.2em]">{loading ? 'تصدیق ہو رہی ہے...' : (isLogin ? 'لاگ ان کریں' : 'جوائن کریں')}</span>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black text-gray-500 hover:text-gold tracking-[0.1em] uppercase transition-colors"
            id="auth-toggle-btn"
          >
            {isLogin ? "نیا اکاؤنٹ بنائیں" : "پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں"}
          </button>
        </div>
      </motion.div>

      {/* Trust Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 pointer-events-none">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold">SSL SECURE</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold">PROVABLY SAFE</span>
        </div>
      </div>
    </div>
  );
}
