import express from 'express';
import { Transaction } from '../models/Transaction.ts';
import { authenticate } from '../middleware/auth.ts';
import { getSafeUser } from '../utils/dbHelper.ts';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/balance', authenticate, async (req: any, res) => {
  try {
    const user = await getSafeUser(req.user.id);
    res.json({ balance: user?.balance ?? 0 });
  } catch (err) {
    res.json({ balance: 0 });
  }
});

router.post('/deposit', authenticate, async (req: any, res) => {
  try {
    const { amount, transactionId, method } = req.body;
    if (amount < 100) return res.status(400).json({ message: 'Minimum deposit is 100' });
    
    if (mongoose.connection.readyState !== 1) {
       return res.status(201).json({ message: 'Deposit request submitted (Demo Mode)', transaction: { amount, status: 'pending' } });
    }

    const transaction = new Transaction({
    userId: req.user.id,
    type: 'deposit',
    amount,
    transactionId,
    method,
    status: 'pending'
  });
  await transaction.save();
  res.status(201).json({ message: 'Deposit request submitted', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Error processing deposit' });
  }
});

router.post('/withdraw', authenticate, async (req: any, res) => {
  try {
    const { amount, method, accountNumber, accountName } = req.body;
    if (amount < 500) return res.status(400).json({ message: 'Minimum withdrawal is 500' });
    if (!accountNumber || !accountName) return res.status(400).json({ message: 'Account details are required' });
    
    const user = await getSafeUser(req.user.id);
    if (!user || user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
  
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({ message: 'Withdrawal request submitted (Demo Mode)', transaction: { amount, status: 'pending' } });
    }

  const transaction = new Transaction({
    userId: req.user.id,
    type: 'withdraw',
    amount,
    method,
    accountNumber,
    accountName,
    status: 'pending'
  });
  await transaction.save();
  
  // Deduct balance immediately for withdrawal request to prevent double spending
  user.balance -= amount;
  await user.save();
  
  res.status(201).json({ message: 'Withdrawal request submitted', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Error processing withdrawal' });
  }
});

router.get('/history', authenticate, async (req: any, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transaction history' });
  }
});

export default router;
