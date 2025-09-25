import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { submitClaim } from '../controllers/claims.controller';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const claimSchema = z.object({ cardId: z.string(), pattern: z.string() });

router.post('/', requireAuth, validateBody(claimSchema), submitClaim);

export default router;
