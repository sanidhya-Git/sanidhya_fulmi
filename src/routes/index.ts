// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import backgroundRoutes from "./background";
import cardsRoutes from "./cards";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/backgrounds", backgroundRoutes);
router.use("/cards", cardsRoutes);

export default router;
