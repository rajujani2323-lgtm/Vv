import express from 'express';
import { User } from '../models/User.ts';
import { Transaction } from '../models/Transaction.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';

const router = express.Router();

router.get('/stats', authenticate, isAdmin, async (req: any, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBalance = await User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]);
    const pendingDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
    const pendingWithdraws = await Transaction.countDocuments({ type: 'withdraw', status: 'pending' });
    
    res.json({
      totalUsers,
      totalBalance: totalBalance[0]?.total || 0,
      pendingDeposits,
      pendingWithdraws
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

router.get('/transactions', authenticate, isAdmin, async (req: any, res) => {
  const transactions = await Transaction.find().populate('userId', 'username phone').sort({ createdAt: -1 });
  res.json(transactions);
});

router.post('/approve', authenticate, isAdmin, async (req: any, res) => {
  const { transactionId, status } = req.body; // status: 'approved' or 'rejected'
  const transaction = await Transaction.findById(transactionId);
  if (!transaction || transaction.status !== 'pending') return res.status(400).json({ message: 'Invalid transaction' });

  if (status === 'approved') {
    if (transaction.type === 'deposit') {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: transaction.amount } });
    }
    // If withdrawal was rejected, return balance
  } else if (status === 'rejected' && transaction.type === 'withdraw') {
    await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: transaction.amount } });
  }

  transaction.status = status;
  await transaction.save();
  res.json({ message: `Transaction ${status}`, transaction });
});

router.get('/users', authenticate, isAdmin, async (req: any, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.json(users);
});

router.post('/adjust-balance', authenticate, isAdmin, async (req: any, res) => {
  const { userId, amount, type } = req.body; // type: 'add' or 'deduct'
  const adjustment = type === 'add' ? amount : -amount;
  await User.findByIdAndUpdate(userId, { $inc: { balance: adjustment } });
  res.json({ message: 'Balance adjusted' });
});

router.post('/toggle-status', authenticate, isAdmin, async (req: any, res) => {
  const { userId, status } = req.body;
  await User.findByIdAndUpdate(userId, { status });
  res.json({ message: `User account ${status}` });
});

router.delete('/user/:userId', authenticate, isAdmin, async (req: any, res) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  await Transaction.deleteMany({ userId });
  res.json({ message: 'User deleted successfully' });
});

router.post('/settings', authenticate, isAdmin, async (req: any, res) => {
  const settings = req.body;
  const currentSettings = req.app.get('gameSettings') || {};
  req.app.set('gameSettings', { ...currentSettings, ...settings });
  res.json({ message: 'Settings updated successfully', settings: req.app.get('gameSettings') });
});

router.get('/settings', authenticate, isAdmin, async (req: any, res) => {
  res.json(req.app.get('gameSettings'));
});

router.post('/crash-stop', authenticate, isAdmin, async (req: any, res) => {
  const crashState = req.app.get('crashState');
  if (crashState && crashState.status === 'running') {
     crashState.forceCrash = true;
     return res.json({ message: 'Crash game will stop on next tick' });
  }
  res.json({ message: 'Game is not running' });
});

export default router;
