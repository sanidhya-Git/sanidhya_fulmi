import mongoose from "mongoose";

const backgroundSchema = new mongoose.Schema({
  backgroundImageUrl: { type: String, required: true },
  welcomeMessage: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Background", backgroundSchema);
