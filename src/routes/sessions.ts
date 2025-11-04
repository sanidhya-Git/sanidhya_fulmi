import express from "express";
import {
  createSession,
  startSession,
  callNumber,
  getSessionDetails,
  declareWinner,
  getSessionParticipants,
  setSessionPatterns, 
} from "../controllers/sessions.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = express.Router();

router.post("/", createSession);
router.post("/:id/start", startSession);
router.post("/:id/call-number", callNumber);
router.get("/:id", getSessionDetails);
router.post("/:id/winner", declareWinner);
router.get("/:id/participants", getSessionParticipants); 
router.post("/:id/patterns", requireAuth, requireAdmin, setSessionPatterns);
router.post("/:id/declare", requireAuth, declareWinner);


export default router;
