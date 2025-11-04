import { Request, Response } from "express";
import BingoCard from "../models/BingoCard";
import { generateBingoCard } from "../utils/generateCard";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User";
import CalledNumber from "../models/CalledNumber";
import AdminSettingsModel from "../models/AdminSettings";
import GameSessionModel from "../models/GameSession";
import { Types } from "mongoose";


export async function getAllCalledNumbers(req: Request, res: Response) {
  try {
    const all = await CalledNumber.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function callNumbersForToday(req: Request, res: Response) {
  try {
    const { limit, sessionId } = req.body;
    const adminId = (req as any).user.userId;

    if (!sessionId)
      return res.status(400).json({ success: false, error: "Session ID is required" });


    const session = await GameSessionModel.findById(sessionId);
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found" });

    if (!limit || limit < 1 || limit > 10)
      return res.status(400).json({ success: false, error: "Limit must be between 1–10" });


    const today = new Date().toISOString().split("T")[0];
    const alreadyCalled = await CalledNumber.findOne({ sessionId, date: today });
    if (alreadyCalled)
      return res
        .status(400)
        .json({ success: false, error: "Numbers already called for this session today" });


    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const calledNumbers: number[] = [];

    while (calledNumbers.length < limit) {
      const idx = Math.floor(Math.random() * allNumbers.length);
      const num = allNumbers.splice(idx, 1)[0];
      calledNumbers.push(num);
    }

   
    await CalledNumber.create({
      sessionId: new Types.ObjectId(sessionId),
      numbers: calledNumbers,
      date: today,
      createdBy: adminId,
    });

    session.calledNumbers.push(...calledNumbers);
    await session.save();

    res.status(201).json({
      success: true,
      message: `Today's ${limit} numbers have been called for session ${session.name}.`,
      data: { sessionId, date: today, numbers: calledNumbers },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function getUsers(req: Request, res: Response) {
  try {
    const users = await User.find({}, "name email role createdAt").sort({
      createdAt: -1,
    });
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function generateCardsByAdmin(req: Request, res: Response) {
  try {
    const { count, sessionId } = req.body;
    const adminId = (req as any).user.userId;

    if (!count || count < 1)
      return res.status(400).json({ success: false, error: "Invalid card count" });

    if (!sessionId)
      return res.status(400).json({ success: false, error: "Session ID is required" });

    // Fetch the admin user
    const adminUser = await User.findById(adminId);
    if (!adminUser)
      return res.status(404).json({ success: false, error: "Admin not found" });

    const cards = [];

    for (let i = 0; i < count; i++) {
      const card = {
        cardId: uuidv4(),
        board: generateBingoCard(),
        createdBy: adminId,
        userId: adminId, 
        sessionId: sessionId, 
        isAssigned: false,
      };
      cards.push(card);
    }

    await BingoCard.insertMany(cards);

    res.status(201).json({
      success: true,
      message: `${count} cards generated successfully for session ${sessionId}`,
      data: cards.map(c => ({ cardId: c.cardId })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function updatePatternLimits(req: Request, res: Response) {
  try {
    const { patterns } = req.body;

    if (!patterns || typeof patterns !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid pattern data" });
    }

    let settings = await AdminSettingsModel.findOne();
    if (!settings) settings = new AdminSettingsModel();

    for (const [pattern, max] of Object.entries(patterns)) {
      const value = Number(max);
      if (isNaN(value) || value < 0) continue;
      settings.maxClaimsPerPattern.set(pattern, value);
      settings.remainingClaimsPerPattern.set(pattern, value);
    }

    await settings.save();

    res.json({
      success: true,
      message: "Pattern limits updated successfully",
      data: Object.fromEntries(settings.maxClaimsPerPattern),
    });
  } catch (err: any) {
    console.error("Error updating pattern limits:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function getPatternLimits(req: Request, res: Response) {
  try {
    const settings = await AdminSettingsModel.findOne();
    if (!settings)
      return res.json({ success: true, data: {}, remaining: {} });

    res.json({
      success: true,
      data: Object.fromEntries(settings.maxClaimsPerPattern),
      remaining: Object.fromEntries(settings.remainingClaimsPerPattern),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function resetRemainingClaims(req: Request, res: Response) {
  try {
    const settings = await AdminSettingsModel.findOne();
    if (!settings)
      return res.status(404).json({ success: false, error: "Settings not found" });

    for (const [pattern, max] of settings.maxClaimsPerPattern.entries()) {
      settings.remainingClaimsPerPattern.set(pattern, max);
    }

    await settings.save();

    res.json({
      success: true,
      message: "Remaining claims reset successfully for all patterns.",
      remaining: Object.fromEntries(settings.remainingClaimsPerPattern),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
