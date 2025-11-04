// src/models/MarkedNumber.ts
import mongoose from "mongoose";

const markedNumberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  number: { type: Number, required: true },
  date: { type: String, required: true }, // match CalledNumber.date
  markedAt: { type: Date, default: Date.now },
});

export default mongoose.model("MarkedNumber", markedNumberSchema);
