import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, CheckCircle2, Loader2, Upload, Receipt, Wallet as WalletIcon, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function WalletView() {
  const { user, token, updateBalance } = useAuth();
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (type === 'deposit' && !screenshot && !transactionId) {
        throw new Error('Please provide TID or upload a screenshot');
      }

      const endpoint = type === 'deposit' ? '/api/wallet/deposit' : '/api/wallet/withdraw';
      const body = type === 'deposit' 
        ? { amount: Number(amount), transactionId: transactionId || 'SCREENSHOT_UPLOADED', method: paymentMethod } 
        : { amount: Number(amount), method: paymentMethod, accountNumber, accountName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server error or downtime');
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error('Session expired');
      }

      if (!res.ok) throw new Error(data.message || 'Request failed');

      setMessage({ text: "Request Submitted Successfully", type: 'success' });
      setAmount('');
      setTransactionId('');
      setScreenshot(null);
      
      if (type === 'withdraw') {
        const balRes = await fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } });
        if (balRes.ok) {
          try {
            const balData = await balRes.json();
            if(balData.balance !== undefined) updateBalance(balData.balance);
          } catch(e) {}
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black italic tracking-tighter">FINANCIAL <span className="text-gold">PORTAL</span></h1>
        <p className="text-gray-400 font-medium text-sm tracking-widest uppercase">Secure Transactions</p>
      </header>

      <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
        <button
          onClick={() => { setType('deposit'); setMessage(null); }}
          className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all
            ${type === 'deposit' 
              ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.2)]' 
              : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
        >
          <ArrowUpCircle className="w-6 h-6" />
          <div className="text-center leading-tight">
            <span className="font-black block uppercase tracking-widest text-[10px]">Deposit</span>
          </div>
        </button>
        <button
          onClick={() => { setType('withdraw'); setMessage(null); }}
          className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all
            ${type === 'withdraw' 
              ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.2)]' 
              : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
        >
          <ArrowDownCircle className="w-6 h-6" />
          <div className="text-center leading-tight">
            <span className="font-black block uppercase tracking-widest text-[10px]">Withdraw</span>
          </div>
        </button>
      </div>

      <div className="glass-card p-6 md:p-10 border-white/5 relative overflow-hidden">
        {/* Decorative background logo */}
        <WalletIcon className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.02] pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Select Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'jazzcash', label: 'JazzCash', icon: Smartphone },
                ...(type === 'withdraw' ? [
                  { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
                  { id: 'bank', label: 'Bank', icon: Building2 }
                ] : [])
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === method.id
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-[10px] items-center font-black uppercase tracking-wider">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {type === 'withdraw' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pb-4"
              >
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] text-xl font-bold transition-all placeholder:text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] text-xl font-bold transition-all placeholder:text-gray-700"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Amount (PKR)
            </label>
            <input
              type="number"
              required
              min={type === 'deposit' ? 100 : 500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === 'deposit' ? "Min. 100" : "Min. 500"}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] text-2xl font-black tabular-nums transition-all placeholder:text-gray-700"
            />
          </div>

          <AnimatePresence mode="popLayout">
            {type === 'deposit' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8"
              >
                {/* Official Receiver Details Demo */}
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Official Receiver</p>
                    {paymentMethod === 'jazzcash' && <p className="font-mono text-lg font-bold">0307145477 (Imran Khan)</p>}
                    <p className="text-xs text-gray-500 mt-2 font-medium">Please send the amount here before submitting.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Proof of Payment
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Transaction ID (TID)"
                        className="w-full h-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-mono placeholder:text-gray-700 placeholder:font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 font-black uppercase tracking-widest">OR</span>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden" 
                      />
                      
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border border-dashed transition-all ${
                          screenshot 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                          : 'bg-white/[0.02] border-white/10 hover:border-gold/30 hover:bg-white/[0.05] text-gray-400'
                        }`}
                      >
                        {screenshot ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {screenshot ? 'Attached' : 'Screenshot'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl flex flex-col gap-1 border ${
                message.type === 'success' ? 'bg-green-500/5 text-green-400 border-green-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span className="text-sm font-bold leading-tight">{message.text}</span>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 gold-gradient text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (type === 'deposit' ? 'VERIFY DEPOSIT' : 'REQUEST WITHDRAWAL')}
          </button>
        </form>
      </div>

      <div className="bg-gold/[0.02] border border-gold/10 p-8 rounded-3xl flex items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <AlertCircle className="w-32 h-32 text-gold" />
        </div>
        <AlertCircle className="w-8 h-8 text-gold shrink-0 relative z-10" />
        <div className="relative z-10">
          <h4 className="font-black text-lg text-gold mb-1 tracking-tight">VIP PROCESSING RULES</h4>
          <ul className="text-sm text-gray-400 space-y-3 font-medium mt-4">
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span> Processing time: 5-15 minutes (VIP Track)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span> Withdrawals are strictly processed to your registered mobile account.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span> Fraudulent TIDs or fake screenshots lead to instant account termination.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
