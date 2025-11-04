// src/models/AdminSettings.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAdminSettings extends Document {
  maxClaimsPerPattern: Map<string, number>;
  remainingClaimsPerPattern: Map<string, number>;
  cardsPerUserDefault: number;
}

const AdminSettingsSchema = new Schema<IAdminSettings>({
  maxClaimsPerPattern: { type: Map, of: Number, default: {} },
  remainingClaimsPerPattern: { type: Map, of: Number, default: {} },
  cardsPerUserDefault: { type: Number, default: 1 },
});

export const AdminSettingsModel = mongoose.model<IAdminSettings>(
  "AdminSettings",
  AdminSettingsSchema
);
export default AdminSettingsModel;
