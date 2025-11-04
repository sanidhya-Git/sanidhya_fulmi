// src/controllers/markNumber.controller.ts
import { Request, Response } from "express";
import CalledNumber from "../models/CalledNumber";
import MarkedNumber from "../models/Markednumber";
export async function getMarkedNumbers(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const today = new Date().toISOString().split("T")[0];
    const marked = await MarkedNumber.find({ userId, date: today });
    res.json({ success: true, data: marked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
export async function markNumber(req: Request, res: Response) {
  try {
    const { number } = req.body;
    const userId = (req as any).user.userId;

    if (!number)
      return res.status(400).json({ success: false, message: "Number is required" });

    const today = new Date().toISOString().split("T")[0];
    const called = await CalledNumber.findOne({ date: today });

    if (!called)
      return res.status(400).json({ success: false, message: "No numbers called today" });

    if (!called.numbers.includes(number))
      return res.status(400).json({ success: false, message: "This number was not called today" });

    const alreadyMarked = await MarkedNumber.findOne({ userId, number, date: today });
    if (alreadyMarked)
      return res.status(400).json({ success: false, message: "Already marked" });

    const marked = await MarkedNumber.create({ userId, number, date: today });

    res.json({ success: true, message: "Number marked successfully", data: marked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
