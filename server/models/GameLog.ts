import mongoose from 'mongoose';

const gameLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, enum: ['crash', 'mines', 'dice'], required: true },
  betAmount: { type: Number, required: true },
  multiplier: { type: Number, required: true },
  winAmount: { type: Number, required: true },
  serverSeed: { type: String, required: true },
  clientSeed: { type: String, required: true },
  outcome: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const GameLog = mongoose.model('GameLog', gameLogSchema);
