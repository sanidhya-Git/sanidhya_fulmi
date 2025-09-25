import { Schema, model } from 'mongoose';

const CellSchema = new Schema({
  number: { type: Number, required: true },
  marked: { type: Boolean, default: false }
}, { _id: false });

const BingoCardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
  cardId: { type: String, required: true, unique: true },
  grid: { type: [[CellSchema]], required: true }, // 5x5 rows
  createdAt: { type: Date, default: Date.now }
});

export default model('BingoCard', BingoCardSchema);
