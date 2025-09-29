import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  currentNumbers: number[];
  claimLimits: Record<string, number>;
}

const gameSchema = new Schema<IGame>({
  currentNumbers: { type: [Number], default: [] },
  claimLimits: {
    type: Map,
    of: Number,
    default: { corners: 10, topLine: 10, middleLine: 10, bottomLine: 10 },
  },
});

export const Game = mongoose.model<IGame>("Game", gameSchema);
