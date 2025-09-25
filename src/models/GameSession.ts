import { Schema, model } from 'mongoose';

const GameSessionSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'running', 'finished'], default: 'waiting' },
  calledNumbers: { type: [Number], default: [] },
  cardGenerationAmount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default model('GameSession', GameSessionSchema);
