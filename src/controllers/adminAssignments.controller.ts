import { Request, Response } from "express";
import { Types } from "mongoose";
import { BingoCardModel } from "../models/BingoCard";
import UserModel from "../models/User";
import GameSessionModel from "../models/GameSession";

/**
 * 🔍 Get all assigned Bingo cards grouped with user and session info.
 * Optional query params:
 *  - sessionId
 *  - page (default 1)
 *  - limit (default 20)
 */
export async function getAllCardAssignments(req: Request, res: Response) {
  try {
    const { sessionId, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const matchStage: any = { isAssigned: true, userId: { $ne: null } };
    if (sessionId && typeof sessionId === "string" && Types.ObjectId.isValid(sessionId)) {
      matchStage.sessionId = new Types.ObjectId(sessionId);
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "gamesessions",
          localField: "sessionId",
          foreignField: "_id",
          as: "session",
        },
      },
      { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          cardId: 1,
          isAssigned: 1,
          updatedAt: 1, // use this as "assignedAt"
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "session._id": 1,
          "session.name": 1,
          "session.startDate": 1,
          "session.endDate": 1,
          "session.status": 1,
        },
      },
      { $sort: { updatedAt: -1 } },
    ];

    const total = await BingoCardModel.countDocuments(matchStage);

    pipeline.push({ $skip: (pageNum - 1) * limitNum });
    pipeline.push({ $limit: limitNum });

    const data = await BingoCardModel.aggregate(pipeline);

    return res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      data,
    });
  } catch (err: any) {
    console.error("getAllCardAssignments error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}


export async function getAssignmentsBySession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));

    if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, error: "Invalid sessionId" });
    }

    const match = {
      sessionId: new Types.ObjectId(sessionId),
      isAssigned: true,
      userId: { $ne: null },
    };

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          cardId: 1,
          board: 0,
          marked: 1,
          isAssigned: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          sessionId: 1,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const total = await BingoCardModel.countDocuments(match);
    const data = await BingoCardModel.aggregate(pipeline);

    return res.json({ success: true, total, page, limit, data });
  } catch (err: any) {
    console.error("getAssignmentsBySession error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
/**
 * 👤 Get all cards assigned to a specific user (optionally by session).
 */
export async function getUserAssignments(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const query: any = { userId: new Types.ObjectId(userId), isAssigned: true };
    if (sessionId && typeof sessionId === "string" && Types.ObjectId.isValid(sessionId)) {
      query.sessionId = new Types.ObjectId(sessionId);
    }

    const cards = await BingoCardModel.find(query)
      .populate("sessionId", "name startDate endDate status")
      .populate("userId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      total: cards.length,
      data: cards,
    });
  } catch (err: any) {
    console.error("getUserAssignments error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
