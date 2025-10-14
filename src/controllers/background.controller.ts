import { Request, Response } from "express";
import {
  uploadBackgroundImageFromURL,
  createBackground,
  getBackgrounds,
  getActiveBackground,
} from "../services/background.service";

export async function uploadBackground(req: Request, res: Response) {
  try {
    const { image, welcomeMessage, startDate, endDate } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const imageUrl = await uploadBackgroundImageFromURL(image);

    const background = await createBackground({
      backgroundImageUrl: imageUrl,
      welcomeMessage,
      startDate,
      endDate,
    });

    res.status(201).json({ success: true, data: background });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listBackgrounds(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await getBackgrounds(page, limit);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function getCurrentBackground(req: Request, res: Response) {
  try {
    const active = await getActiveBackground();
    if (!active)
      return res.status(404).json({ success: false, message: "No active background found" });

    res.json({ success: true, data: active });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
