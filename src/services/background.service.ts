import BackgroundConfig, { IBackgroundConfig } from "../models/BackgroundConfig";
import cloudinary from "../config/cloudinary";

export async function uploadBackgroundImageFromURL(imageBase64: string): Promise<string> {
  // Direct upload from base64 or remote URL to Cloudinary
  const res = await cloudinary.uploader.upload(imageBase64, {
    folder: "bingo_backgrounds",
  });
  return res.secure_url;
}

export async function createBackground(data: {
  backgroundImageUrl: string;
  welcomeMessage: string;
  startDate: string;
  endDate: string;
}): Promise<IBackgroundConfig> {
  const config = new BackgroundConfig(data);
  await config.save();
  return config;
}

export async function getBackgrounds(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await BackgroundConfig.countDocuments();
  const data = await BackgroundConfig.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data,
  };
}

export async function getActiveBackground() {
  const now = new Date();
  const active = await BackgroundConfig.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ createdAt: -1 })
    .lean();
  return active;
}
