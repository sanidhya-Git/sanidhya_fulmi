import { Request, Response } from "express";
import fs from "fs";
import {
  uploadBackgroundImage,
  createBackground,
  getBackgrounds,
  getActiveBackground,
} from "../services/background.service";

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function uploadBackground(req: MulterRequest, res: Response) {
  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Upload to Cloudinary (or your chosen service)
    const imageUrl = await uploadBackgroundImage(req.file.path);

    // Remove temporary local file
    fs.unlinkSync(req.file.path);

    const { welcomeMessage, startDate, endDate } = req.body;

    // Create background record in DB
    const background = await createBackground({
      backgroundImageUrl: imageUrl,
      welcomeMessage,
      startDate,
      endDate,
    });

    return res.status(201).json({
      success: true,
      message: "Background uploaded successfully",
      data: background,
    });
  } catch (err: any) {
    console.error("Upload background error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}

export async function listBackgrounds(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getBackgrounds(page, limit);

    return res.status(200).json({
      success: true,
      message: "Backgrounds fetched successfully",
      ...result,
    });
  } catch (err: any) {
    console.error("List backgrounds error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}

export async function getCurrentBackground(req: Request, res: Response) {
  try {
    const active = await getActiveBackground();

    if (!active) {
      return res.status(404).json({
        success: false,
        message: "No active background found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active background fetched successfully",
      data: active,
    });
  } catch (err: any) {
    console.error("Get current background error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}
