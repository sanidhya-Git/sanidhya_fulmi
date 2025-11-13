// src/routes/session.ts
import express from "express";
import {
  createSession,
  startSession,
  callNumber,
  getSessionDetails,
  declareWinner,
  getSessionParticipants,
  setSessionPatterns,
  listSessions, // <- new import
} from "../controllers/sessions.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = express.Router();

// Public: list all sessions (filter by status, pagination, optional q)
router.get("/", listSessions);

// Admin routes
router.post("/", requireAuth, requireAdmin, createSession);
router.post("/:id/start", requireAuth, requireAdmin, startSession);
router.post("/:id/call-number", requireAuth, requireAdmin, callNumber);
router.post("/:id/winner", requireAuth, requireAdmin, declareWinner);

// Session info
router.get("/:id", getSessionDetails);
router.get("/:id/participants", requireAuth, requireAdmin, getSessionParticipants);

// Patterns
router.post("/:id/patterns", requireAuth, requireAdmin, setSessionPatterns);

export default router;
