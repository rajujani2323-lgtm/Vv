import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserCheck, CreditCard, Check, X, AlertCircle, Trash2, Ban, Unlock, Plus, Settings, PlaySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminView() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings' | 'games'>('transactions');
  const [data, setData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ winRateMultiplier: 0.5 });
  const [loading, setLoading] = useState(true);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  const stopCrashGame = async () => {
    try {
      const res = await fetch('/api/admin/crash-stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setSettings(result || { winRateMultiplier: 0.5 });
      } else {
        const endpoint = activeTab === 'users' ? '/api/admin/users' : '/api/admin/transactions';
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setData(Array.isArray(result) ? result : []);
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    alert('Settings Updated Successfully!');
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await fetch('/api/admin/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, status: newStatus })
    });
    fetchData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? All their data will be wiped.')) return;
    await fetch(`/api/admin/user/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleAdjustBalance = async (type: 'add' | 'deduct') => {
    if (!selectedUserId || !adjustmentAmount) return;
    await fetch('/api/admin/adjust-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(adjustmentAmount), type })
    });
    setIsAdjustmentModalOpen(false);
    setAdjustmentAmount('');
    fetchData();
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ transactionId: id, status })
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-gold w-8 h-8" />
            Admin Control Center
          </h1>
          <p className="text-gray-400">Total Management: Users, Money, and Math.</p>
        </div>
        <div className="flex flex-wrap glass-card p-1">
          {['transactions', 'users', 'games', 'settings'].map((tab: any) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-white/5">
          {activeTab === 'games' ? (
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-2xl font-black text-gold">Game CMS & Control</h2>
                   <p className="text-gray-400 text-sm">Add new games, update logos, and manage features.</p>
                 </div>
                 <button className="gold-gradient text-black font-black px-6 py-2 rounded-xl flex items-center gap-2">
                   <Plus className="w-5 h-5" /> 
                   <span>Add New Game</span>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { title: 'Crash Game', status: 'Active', category: 'Instant', image: 'TrendingUp', action: stopCrashGame },
                   { title: 'Mines', status: 'Active', category: 'Skill', image: 'Grid3x3' },
                   { title: 'Dragon Tiger', status: 'Active', category: 'Cards', image: 'Swords' }
                 ].map((g, i) => (
                    <div key={i} className="glass-card p-6 border-white/10 group hover:border-gold/30 transition-all flex flex-col items-center text-center space-y-4 relative overflow-hidden">
                       <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                          <AlertCircle className="w-10 h-10 text-gold" />
                       </div>
                       <div>
                         <h4 className="font-bold text-lg">{g.title}</h4>
                         <p className="text-xs text-gray-500 uppercase tracking-widest">{g.category}</p>
                       </div>
                       <div className="w-full flex gap-2">
                         {g.action ? (
                           <button onClick={g.action} className="flex-1 py-2 text-xs font-bold border border-red-500/50 text-red-500 rounded hover:bg-red-500/10">Stop Game Now</button>
                         ) : (
                           <button className="flex-1 py-2 text-xs font-bold border border-white/10 rounded hover:bg-white/5">Edit Details</button>
                         )}
                         <button className="flex-1 py-2 text-xs font-bold border border-white/10 rounded hover:bg-white/5">Features</button>
                       </div>
                       <div className="absolute top-2 right-2 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500" />
                           <span className="text-[9px] uppercase font-bold text-green-500">{g.status}</span>
                       </div>
                    </div>
                 ))}
                 
                 <div className="glass-card p-6 border-dashed border-white/20 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all min-h-[220px]">
                    <Plus className="w-10 h-10 text-gray-500 mb-2" />
                    <p className="text-gray-400 font-bold text-sm">Upload New Game Mod</p>
                    <p className="text-[10px] text-gray-600 mt-1">Supports JSON configs & Logo assets</p>
                 </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 border-gold/10 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gold" />
                    Game Control (Jeet/Haar)
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Win Rate Ratio ({Math.round((settings.winSkew ?? 0.5) * 100)}%)
                      </label>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={settings.winSkew ?? 0.5}
                        onChange={(e) => setSettings({...settings, winSkew: parseFloat(e.target.value)})}
                        className="w-full accent-green-500 bg-white/10 rounded-lg h-2"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Higher value means users win more often.</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Loss Rate Ratio ({Math.round((settings.lossSkew ?? 0.8) * 100)}%)
                      </label>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={settings.lossSkew ?? 0.8}
                        onChange={(e) => setSettings({...settings, lossSkew: parseFloat(e.target.value)})}
                        className="w-full accent-red-500 bg-white/10 rounded-lg h-2"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Higher value means users lose more often (House edge).</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border-gold/10 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Dragon Tiger Skew
                  </h3>
                  <select 
                    value={settings.dragonTigerMode || 'random'}
                    onChange={(e) => setSettings({...settings, dragonTigerMode: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-gold outline-none"
                  >
                    <option value="random">Native Random (Truly Fair)</option>
                    <option value="force_loss">Force Loss (Always Skew to Dealer)</option>
                    <option value="force_win">Force Win (User Advantage)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleUpdateSettings}
                  className="gold-gradient text-black font-black px-12 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg"
                >
                  SAVE ALL SETTINGS
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-4 text-xs uppercase text-gray-500 font-bold">{activeTab === 'users' ? 'User Info' : 'Details'}</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-bold">Status</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-bold">{activeTab === 'users' ? 'Current Balance' : 'Amount'}</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-bold">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTab === 'transactions' ? (
                    data.map((t: any) => (
                      <tr key={t._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-bold">{t.userId?.username || 'Guest'}</p>
                          <p className="text-[10px] text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                          {t.transactionId && <p className="text-[10px] text-gold mt-1 font-mono">TID: {t.transactionId}</p>}
                          {t.method && <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest bg-white/5 inline-block px-1 rounded">{t.method}</p>}
                          {t.type === 'withdraw' && t.accountNumber && (
                            <div className="mt-2 bg-black/50 p-2 rounded border border-white/5">
                              <p className="text-xs font-mono font-bold text-white">{t.accountNumber}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{t.accountName}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 uppercase">
                          <span className={`${t.type === 'deposit' ? 'text-blue-400' : 'text-orange-400'} font-black`}>
                            {t.type}
                          </span>
                          <span className={`block text-[10px] ${t.status === 'approved' ? 'text-green-500' : t.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 font-black">PKR {t.amount?.toLocaleString()}</td>
                        <td className="p-4">
                          {t.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAction(t._id, 'approved')} 
                                className="px-3 py-1 bg-green-500 text-black text-[10px] font-black rounded hover:bg-green-400"
                                title="Approve"
                              >
                                APPROVE
                              </button>
                              <button 
                                onClick={() => handleAction(t._id, 'rejected')} 
                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded hover:bg-red-400"
                                title="Reject"
                              >
                                REJECT
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    data.map((u: any) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-bold">{u.username}</p>
                          <p className="text-[10px] text-gray-500">Member since {new Date(u.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 font-black text-gold">PKR {u.balance?.toLocaleString() ?? 0}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setSelectedUserId(u._id); setIsAdjustmentModalOpen(true); }}
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                              title="Add Money"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusToggle(u._id, u.status)}
                              className={`p-2 rounded-lg transition-all ${u.status === 'active' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500' : 'bg-green-500/10 text-green-500 hover:bg-green-500'} hover:text-white`}
                              title={u.status === 'active' ? 'Block User' : 'Unblock User'}
                            >
                              {u.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Balance Modal */}
      <AnimatePresence>
        {isAdjustmentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 w-full max-w-md border-gold/30"
            >
              <h2 className="text-2xl font-black text-gold mb-6">Adjust User Balance</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Amount (PKR)</label>
                  <input 
                    type="number" 
                    value={adjustmentAmount} 
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-gold outline-none text-xl font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        handleAdjustBalance('add');
                    }}
                    className="flex-1 py-4 bg-green-500/20 text-green-500 font-black rounded-xl hover:bg-green-500 hover:text-white transition-all"
                  >
                    Add (+)
                  </button>
                  <button 
                    onClick={() => {
                        handleAdjustBalance('deduct');
                    }}
                    className="flex-1 py-4 bg-red-500/20 text-red-500 font-black rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    Deduct (-)
                  </button>
                </div>
                <button 
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="w-full py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 mt-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
