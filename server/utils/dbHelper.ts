import mongoose from 'mongoose';
import { User } from '../models/User.ts';

export async function getSafeUser(userId: string) {
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('DB Disconnected');
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    return null;
  }
}
