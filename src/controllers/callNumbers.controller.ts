
import { Request, Response } from "express";
import CalledNumber from "../models/CalledNumber";
import { getRandomNumbers } from "../utils/randomNumbers";
export async function getTodaysCalledNumbers(req: Request, res: Response) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const record = await CalledNumber.findOne({ date: today });

    if (!record) {
      return res.status(404).json({ success: false, message: "No numbers called today" });
    }

    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
export async function callRandomNumbers(req: Request, res: Response) {
  try {
    const { limit } = req.body;
    if (!limit || limit <= 0) {
      return res.status(400).json({ success: false, message: "Limit must be positive" });
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await CalledNumber.findOne({ date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: "Numbers already called today" });
    }

    const numbers = getRandomNumbers(limit, 1, 75); 

    const record = await CalledNumber.create({ date: today, numbers });

    res.json({
      success: true,
      message: "Today's numbers called successfully",
      data: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
