import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.ts';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (mongoose.connection.readyState !== 1) {
      // Mock Mode - Demo Accounts
      const isAdmin = username === 'Raju' && password === 'Rizwan2323';
      const token = jwt.sign({ id: 'demo-' + Date.now(), role: isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      return res.status(201).json({ token, user: { username: username, email: email || 'demo@example.com', balance: 5000, role: isAdmin ? 'admin' : 'user' } });
    }

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }]
    });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ username, email, password });
    
    if (username === 'Raju' && password === 'Rizwan2323') {
      user.role = 'admin';
    }
    
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { username: user.username, email: user.email, balance: user.balance, role: user.role } });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      // Mock Mode
      const isAdmin = username === 'Raju' && password === 'Rizwan2323';
      const token = jwt.sign({ id: 'demo-' + Date.now(), role: isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      return res.json({ token, user: { username, email: 'demo@example.com', balance: 5000, role: isAdmin ? 'admin' : 'user' } });
    }
    
    const user = await User.findOne({ username });
    if (!user || !(await (user as any).comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (username === 'Raju' && password === 'Rizwan2323' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, email: user.email, balance: user.balance, role: user.role } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

export default router;
