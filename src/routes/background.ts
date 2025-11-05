// src/routes/background.ts
import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth";
import {
  uploadBackground,
  listBackgrounds,
  getCurrentBackground,
} from "../controllers/background.controller";

const router = Router();

// require authentication AND admin privileges
router.post("/upload", requireAuth, requireAdmin, uploadBackground);

router.get("/", listBackgrounds);
router.get("/active", getCurrentBackground);

export default router;
