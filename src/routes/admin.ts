import express from "express";
import {
  getUsers,
  generateCardsByAdmin,
  callNumbersForToday,
  getAllCalledNumbers,
  updatePatternLimits,
  getPatternLimits,
  resetRemainingClaims,
} from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";


const router = express.Router();

// Existing routes
router.get("/users", requireAuth, requireAdmin, getUsers);
router.post("/generate-cards", requireAuth, requireAdmin, generateCardsByAdmin);
router.post("/call-numbers", requireAuth, requireAdmin, callNumbersForToday);
router.get("/call-numbers", requireAuth, requireAdmin, getAllCalledNumbers);


router.post("/pattern-limits", requireAuth, requireAdmin, updatePatternLimits);
router.get("/pattern-limits", requireAuth, requireAdmin, getPatternLimits);
router.post("/pattern-limits/reset", requireAuth, requireAdmin, resetRemainingClaims);

export default router;
