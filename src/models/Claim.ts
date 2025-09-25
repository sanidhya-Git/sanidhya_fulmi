import { Schema, model } from 'mongoose';

const ClaimSchema = new Schema({
  cardId: { type: Schema.Types.ObjectId, ref: 'BingoCard', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
  pattern: { type: String, required: true },
  valid: { type: Boolean, default: false },
  token: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default model('Claim', ClaimSchema);
