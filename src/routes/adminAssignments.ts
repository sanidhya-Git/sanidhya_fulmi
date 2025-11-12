// src/routes/adminAssignments.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  getAllCardAssignments,
  getUserAssignments,
  getAssignmentsBySession,   // <- add this import
} from "../controllers/adminAssignments.controller";

const router = Router();

router.get("/assignments", requireAuth, requireAdmin, getAllCardAssignments);
router.get("/users/:userId/assignments", requireAuth, requireAdmin, getUserAssignments);

// NEW: assignments by session
router.get("/sessions/:sessionId/assignments", requireAuth, requireAdmin, getAssignmentsBySession);

export default router;
