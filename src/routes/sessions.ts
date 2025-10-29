import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { createSession, startSession, callNumber } from '../controllers/sessions.controller';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const createSchema = z.object({ name: z.string(), cardGenerationAmount: z.number().optional() });
const callSchema = z.object({ number: z.number().min(1).max(75) });

router.post('/', requireAuth, requireAdmin, validateBody(createSchema), createSession);
router.post('/:id/start', requireAuth, requireAdmin, startSession);
router.get('/:id', requireAuth, requireAdmin, startSession);
router.post('/:id/call-number', requireAuth, requireAdmin, validateBody(callSchema), callNumber);


export default router;
