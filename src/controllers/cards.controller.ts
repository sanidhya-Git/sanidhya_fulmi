// 📄 src/controllers/cards.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { BingoCardModel } from "../models/BingoCard";
import { GameSessionModel } from "../models/GameSession";
import UserModel from "../models/User";

/**
 * 🎴 Assign Bingo cards to a user for the current active game session.
 */
export async function assignCardsToUser(req: Request, res: Response) {
  try {
    const { userId, cardCount } = req.body;

    if (!userId || !cardCount) {
      return res.status(400).json({
        success: false,
        message: "userId and cardCount are required.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    // ✅ Find active session (today’s date between start and end, and status 'running')
    const today = new Date();
    const session = await GameSessionModel.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "running",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found for today.",
      });
    }

    // ✅ Check if the user already has cards for this session
    const existingCards = await BingoCardModel.find({
      userId,
      sessionId: session._id,
    });

    if (existingCards.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has assigned cards for this session.",
      });
    }

    // ✅ Find unassigned cards (created by admin)
    const availableCards = await BingoCardModel.find({
      isAssigned: false,
      sessionId: null,
    }).limit(cardCount);

    // 🔹 Auto-generate cards if not enough exist
    if (availableCards.length < cardCount) {
      const deficit = cardCount - availableCards.length;
      console.warn(`⚠️ Only ${availableCards.length} available cards. Generating ${deficit} new ones.`);
      const newCards = Array.from({ length: deficit }).map(() => ({
        cardId: Math.floor(100000 + Math.random() * 900000).toString(),
        board: generateRandomBoard(),
        isAssigned: false,
      }));
      await BingoCardModel.insertMany(newCards);
      const moreCards = await BingoCardModel.find({
        isAssigned: false,
        sessionId: null,
      }).limit(cardCount);
      availableCards.push(...moreCards);
    }

    // ✅ Assign selected cards to the user
    const assignedCards = [];
    for (const card of availableCards.slice(0, cardCount)) {
      card.userId = new mongoose.Types.ObjectId(userId);
      card.sessionId = session._id;
      card.isAssigned = true;
      await card.save();
      assignedCards.push(card);
    }

    return res.status(200).json({
      success: true,
      message: `${assignedCards.length} cards assigned successfully.`,
      sessionId: session._id,
      data: assignedCards,
    });
  } catch (err: any) {
    console.error("assignCardsToUser error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 🔢 Retrieve the numbers called for the current session.
 */
export async function getTodayCalledNumbers(req: Request, res: Response) {
  try {
    const today = new Date();
    const session = await GameSessionModel.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "running",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found for today.",
      });
    }

    return res.status(200).json({
      success: true,
      calledNumbers: session.calledNumbers || [],
    });
  } catch (err: any) {
    console.error("getTodayCalledNumbers error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 🧾 Get all Bingo cards assigned to a user.
 */
export async function getUserCards(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req as any).user?.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const cards = await BingoCardModel.find({ userId }).populate(
      "sessionId",
      "name startDate endDate status calledNumbers"
    );

    if (!cards.length) {
      return res.status(404).json({
        success: false,
        message: "No cards found for this user.",
      });
    }

    return res.status(200).json({ success: true, data: cards });
  } catch (err: any) {
    console.error("getUserCards error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function markNumber(req: Request, res: Response) {
  try {
    const { userId, cardId, number } = req.body;

    if (!userId || !cardId || typeof number !== "number") {
      return res.status(400).json({
        success: false,
        message: "userId, cardId, and number are required.",
      });
    }

    const card = await BingoCardModel.findOne({ cardId, userId });
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found for this user.",
      });
    }

    if (card.marked.includes(number)) {
      return res.status(400).json({
        success: false,
        message: "Number already marked on this card.",
      });
    }

    // ✅ Mark the number
    card.marked.push(number);
    await card.save();

    return res.status(200).json({
      success: true,
      message: "Number marked successfully.",
      markedNumbers: card.marked,
    });
  } catch (err: any) {
    console.error("markNumber error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export function generateRandomBoard(): number[][] {
  const board: number[][] = [];
  const usedNumbers = new Set<number>();

  for (let i = 0; i < 5; i++) {
    const row: number[] = [];
    while (row.length < 5) {
      const num = Math.floor(Math.random() * 75) + 1;
      if (!usedNumbers.has(num)) {
        row.push(num);
        usedNumbers.add(num);
      }
    }
    board.push(row);
  }

  return board;
}
