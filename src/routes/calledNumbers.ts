// src/routes/calledNumbers.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getTodaysCalledNumbers,
} from "../controllers/callNumbers.controller";
import {
  markNumber,
  getMarkedNumbers,
} from "../controllers/markNumber.controller";

const router = Router();

// User endpoints
router.get("/today", requireAuth, getTodaysCalledNumbers);
router.post("/mark", requireAuth, markNumber);
router.get("/marked", requireAuth, getMarkedNumbers);

export default router;
