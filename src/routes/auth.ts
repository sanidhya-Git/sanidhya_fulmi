import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', validateBody(signupSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
