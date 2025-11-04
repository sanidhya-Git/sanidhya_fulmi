import cloudinary from "../config/cloudinary";
import Background from "../models/BackgroundConfig";

interface BackgroundInput {
  backgroundImageUrl: string;
  welcomeMessage?: string;
  startDate?: Date;
  endDate?: Date;
}

// ✅ Upload a Cloudinary image from a URL or base64
export async function uploadBackgroundImageFromURL(image: string): Promise<string> {
  const result = await cloudinary.uploader.upload(image, {
    folder: "mindful_dashboard/backgrounds",
  });
  return result.secure_url;
}

// ✅ Create a new background record
export async function createBackground(data: BackgroundInput) {
  const background = new Background({
    backgroundImageUrl: data.backgroundImageUrl,
    welcomeMessage: data.welcomeMessage,
    startDate: data.startDate,
    endDate: data.endDate,
    uploadedAt: new Date(),
  });
  return background.save();
}

// ✅ Paginate backgrounds
export async function getBackgrounds(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Background.countDocuments();
  const data = await Background.find().sort({ uploadedAt: -1 }).skip(skip).limit(limit);
  return { total, page, limit, data };
}

// ✅ Get currently active background (based on date range)
export async function getActiveBackground() {
  const now = new Date();
  return Background.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ uploadedAt: -1 });
}
