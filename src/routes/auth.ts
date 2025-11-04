import { Router } from "express";
import { registerAdmin, registerUser, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register-admin", registerAdmin);
router.post("/register", registerUser);
router.post("/login", login);

export default router;
