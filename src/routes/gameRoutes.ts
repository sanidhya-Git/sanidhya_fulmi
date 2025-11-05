import { Router } from "express";
import { requireAuth } from "../middleware/auth"; // ✅ fixed import
import GameSession from "../models/GameSession";
import BingoCard from "../models/BingoCard";

const router = Router();

// 🎯 Type for bingo card cells
type Cell = {
  number: number;
  marked: boolean;
};

// 🎯 Helper function to generate a Bingo card (5x5 grid)
function generateBingoCard(): Cell[][] {
  const card: Cell[][] = [];
  const ranges = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75],
  };

  const keys = Object.keys(ranges) as (keyof typeof ranges)[];

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[keys[col]];
    const numbers = shuffleRange(min, max).slice(0, 5);

    for (let row = 0; row < 5; row++) {
      if (!card[row]) card[row] = [];
      card[row][col] = {
        number: numbers[row],
        marked: row === 2 && col === 2 ? true : false, // Free space in middle
      };
    }
  }

  return card;
}

// 🎯 Helper: shuffle a range of numbers
function shuffleRange(min: number, max: number): number[] {
  const arr = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ✅ Start a new game session
router.post("/start", requireAuth, async (req, res) => {
  try {
    const session = new GameSession({ calledNumbers: [] });
    await session.save();
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Generate a card for the logged-in user
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: "Session ID required" });
    }

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const card = new BingoCard({
      userId: user.userId,
      sessionId,
      board: generateBingoCard(), 
    });

    await card.save();
    res.status(201).json({ success: true, data: card });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
