import { Schema, model } from 'mongoose';

const AdminSettingsSchema = new Schema({
  maxClaimsPerPattern: { type: Map, of: Number, default: {} },
  remainingClaimsPerPattern: { type: Map, of: Number, default: {} },
  cardsPerUserDefault: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default model('AdminSettings', AdminSettingsSchema);
