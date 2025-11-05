
import { Request, Response } from "express";
import mongoose from "mongoose";
import GameSessionModel, { IGameSession, IWinner } from "../models/GameSession";
import CalledNumber from "../models/CalledNumber";
import { BingoCardModel } from "../models/BingoCard";


function todayString(): string {
  return new Date().toISOString().split("T")[0];
}


export async function getSessionParticipants(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid session id" });
    }

    const participants = await BingoCardModel.aggregate([
      { $match: { sessionId: new mongoose.Types.ObjectId(id), userId: { $ne: null } } },
      { $group: { _id: "$userId", totalCards: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalCards: 1,
        },
      },
    ]);

    return res.json({ success: true, data: participants });
  } catch (err: any) {
    console.error("getSessionParticipants error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export const setSessionPatterns = async (req: Request, res: Response) => {
  try {
    const session = await GameSessionModel.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    if (!Array.isArray(req.body.patterns)) {
      return res.status(400).json({ success: false, error: "Patterns must be an array" });
    }

    session.patterns = req.body.patterns;
    await session.save();

    res.json({ success: true, data: session.patterns });
  } catch (error: any) {
    console.error("setSessionPatterns error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export async function createSession(req: Request, res: Response) {
  try {
    const { name, startDate, endDate, backgroundId } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid date format" });
    }

    const session = await GameSessionModel.create({
      name,
      startDate: start,
      endDate: end,
      background: backgroundId || null,
      status: "waiting",
      calledNumbers: [],
      winners: [],
      patterns: [],
    });

    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    console.error("createSession error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function startSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid session id" });

    const session = await GameSessionModel.findById(id);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    if (session.status === "running")
      return res.status(400).json({ success: false, error: "Session already running" });

    session.status = "running";
    await session.save();

    res.json({ success: true, message: "Session started", data: session });
  } catch (err: any) {
    console.error("startSession error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function callNumber(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { number } = req.body;

    if (typeof number !== "number" || number < 1 || number > 75) {
      return res.status(400).json({ success: false, error: "Number must be between 1–75" });
    }

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid session id" });

    const session = await GameSessionModel.findById(id);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    if (session.status !== "running")
      return res.status(400).json({ success: false, error: "Session not running" });

    if (session.calledNumbers.includes(number))
      return res.status(409).json({ success: false, error: "Number already called" });

    session.calledNumbers.push(number);
    await session.save();

    const dateStr = todayString();
    await CalledNumber.findOneAndUpdate(
      { date: dateStr, sessionId: session._id },
      { $addToSet: { numbers: number } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: `Number ${number} called`, data: { sessionId: session._id, number } });
  } catch (err: any) {
    console.error("callNumber error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function getSessionDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid session id" });

    const session = await GameSessionModel.findById(id)
      .populate("background")
      .populate("winners.user", "name email");

    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    const players = await BingoCardModel.aggregate([
      { $match: { sessionId: session._id, userId: { $ne: null } } },
      { $group: { _id: "$userId", cardCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          cardCount: 1,
        },
      },
    ]);

    const calledRecords = await CalledNumber.find({
      sessionId: session._id,
      date: { $gte: session.startDate, $lte: session.endDate },
    }).sort({ date: 1 });

    const allCalledNumbers = calledRecords.flatMap((r) => r.numbers);

    res.json({
      success: true,
      data: {
        session,
        players,
        calledNumbers: allCalledNumbers,
        winners: session.winners || [],
        stats: {
          totalPlayers: players.length,
          totalCalledNumbers: allCalledNumbers.length,
          winnersCount: (session.winners && session.winners.length) || 0,
        },
      },
    });
  } catch (err: any) {
    console.error("getSessionDetails error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export const declareWinner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { patternName, userId } = req.body;

    if (!patternName || !userId)
      return res.status(400).json({ success: false, error: "patternName and userId are required" });

    const session = await GameSessionModel.findById(id);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    const pattern = session.patterns.find((p) => p.name === patternName);
    if (!pattern) return res.status(400).json({ success: false, error: "Invalid pattern name" });

    if (pattern.winners.length >= pattern.maxWinners) {
      return res.status(400).json({ success: false, error: "Max winners reached for this pattern" });
    }

    if (pattern.winners.some((w) => w.user.toString() === userId)) {
      return res.status(400).json({ success: false, error: "User already declared winner for this pattern" });
    }


    const winnerObj: IWinner = {
      user: new mongoose.Types.ObjectId(userId),
      pattern: patternName,
      declaredAt: new Date(),
    };

    pattern.winners.push(winnerObj);
    session.winners.push(winnerObj);
    pattern.currentWinners = pattern.winners.length;

    await session.save();

    res.json({ success: true, message: "Winner declared!", data: { pattern, winner: winnerObj } });
  } catch (err: any) {
    console.error("declareWinner error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
