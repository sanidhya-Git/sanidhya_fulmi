import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBingoCard extends Document {
  cardId: string;
  board: number[][];
  marked: number[];
  isAssigned: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  userId?: mongoose.Types.ObjectId | null;
  sessionId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const BingoCardSchema = new Schema<IBingoCard>(
  {
    cardId: { type: String, required: true, unique: true },
    board: {
      type: [[Number]], // ✅ ensures 2D array of numbers
      required: true,
    },
    marked: {
      type: [Number],
      default: [],
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "GameSession", // ✅ must match your session model name
      default: null,
    },
  },
  { timestamps: true }
);

export const BingoCardModel: Model<IBingoCard> = mongoose.model<IBingoCard>(
  "BingoCard",
  BingoCardSchema
);

export default BingoCardModel;
