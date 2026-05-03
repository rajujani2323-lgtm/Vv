import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String }, // For deposits
  method: { type: String }, // 'jazzcash', 'easypaisa', 'bank'
  accountNumber: { type: String },
  accountName: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
