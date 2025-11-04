// src/routes/cards.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { assignCardsToUser, getTodayCalledNumbers, getUserCards, markNumber   } from "../controllers/cards.controller";

const router = Router();

// router.post("/", requireAuth, createCard);
// router.get("/:cardId", requireAuth, getCard);
// router.post("/:cardId/mark", requireAuth, markNumber);
router.post("/generate", requireAuth, assignCardsToUser);
router.post("/mark", requireAuth, markNumber);
router.get("/today-called", requireAuth, getTodayCalledNumbers);
router.post("/assign", requireAuth, assignCardsToUser);
router.get("/users", requireAuth, getUserCards);
router.get('/user', requireAuth, getUserCards);

export default router;
