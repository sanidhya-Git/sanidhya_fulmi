import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth";
import {
  uploadBackground,
  listBackgrounds,
  getCurrentBackground,
} from "../controllers/background.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", requireAdmin, upload.single("image"), uploadBackground);
router.get("/", listBackgrounds);
router.get("/active", getCurrentBackground);

export default router;
