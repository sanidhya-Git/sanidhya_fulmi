import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import {
  uploadBackground,
  listBackgrounds,
  getCurrentBackground,
} from "../controllers/background.controller";

const router = Router();

router.post("/", requireAdmin, uploadBackground);

router.get("/", listBackgrounds);


router.get("/active", getCurrentBackground);

export default router;
