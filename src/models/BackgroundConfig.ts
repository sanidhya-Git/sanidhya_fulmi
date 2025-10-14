import { Schema, model, Document } from "mongoose";

export interface IBackgroundConfig extends Document {
  backgroundImageUrl: string;
  welcomeMessage: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const backgroundConfigSchema = new Schema<IBackgroundConfig>(
  {
    backgroundImageUrl: { type: String, required: true },
    welcomeMessage: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IBackgroundConfig>("BackgroundConfig", backgroundConfigSchema);
