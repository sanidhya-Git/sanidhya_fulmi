import mongoose, { Document, Schema } from 'mongoose';

export default interface IAdminSettings extends Document {
  maxClaimsPerPattern: Map<string, number>;
  remainingClaimsPerPattern: Map<string, number>;
  cardsPerUserDefault: number;
  createdAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>({
  maxClaimsPerPattern: { type: Map, of: Number, default: {} },
  remainingClaimsPerPattern: { type: Map, of: Number, default: {} },
  cardsPerUserDefault: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});


export const AdminSettingsModel = mongoose.model<IAdminSettings>(
  'AdminSettings',
  AdminSettingsSchema
);
