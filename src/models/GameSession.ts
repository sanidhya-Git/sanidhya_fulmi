import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface representing a Winner entry
 */
export interface IWinner {
  user: mongoose.Types.ObjectId;
  pattern: string;
  declaredAt: Date;
}

/**
 * Interface representing a Bingo pattern configuration
 */
export interface IPattern {
  name: string;
  maxWinners: number;
  currentWinners: number;
  winners: IWinner[];
}

/**
 * Interface representing a Game Session
 */
export interface IGameSession extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  background?: mongoose.Types.ObjectId | null;
  status: "waiting" | "running" | "completed";
  calledNumbers: number[];
  winners: IWinner[];
  patterns: IPattern[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Winner Subschema
 */
const WinnerSchema = new Schema<IWinner>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pattern: {
      type: String,
      required: true,
      trim: true,
    },
    declaredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Pattern Subschema
 */
const PatternSchema = new Schema<IPattern>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    maxWinners: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    currentWinners: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    winners: {
      type: [WinnerSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Main GameSession Schema
 */
const GameSessionSchema = new Schema<IGameSession>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    background: {
      type: Schema.Types.ObjectId,
      ref: "Background",
      default: null,
    },
    status: {
      type: String,
      enum: ["waiting", "running", "completed"],
      default: "waiting",
    },
    calledNumbers: {
      type: [Number],
      default: [],
    },
    winners: {
      type: [WinnerSchema],
      default: [],
    },
    patterns: {
      type: [PatternSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export const GameSessionModel = mongoose.model<IGameSession>(
  "GameSession",
  GameSessionSchema
);

export default GameSessionModel;
