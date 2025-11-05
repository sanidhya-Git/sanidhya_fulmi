
import mongoose, { Schema, Document } from "mongoose";

export interface ICalledNumber extends Document {
  sessionId: mongoose.Types.ObjectId;
  numbers: number[];
  date: string;
  createdBy: mongoose.Types.ObjectId;
}

const CalledNumberSchema = new Schema<ICalledNumber>({
  sessionId: { type: Schema.Types.ObjectId, ref: "GameSession", required: true },
  numbers: { type: [Number], required: true },
  date: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model<ICalledNumber>("CalledNumber", CalledNumberSchema);
