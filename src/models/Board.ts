import mongoose, { Schema, Document } from "mongoose";

export interface IBoard extends Document {
  userId: mongoose.Types.ObjectId;
  board: number[][];
  marked: boolean[][];
}

const boardSchema = new Schema<IBoard>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  board: { type: [[Number]], required: true },
  marked: { type: [[Boolean]], default: Array(5).fill(Array(5).fill(false)) }
});

export default mongoose.model<IBoard>("Board", boardSchema);
