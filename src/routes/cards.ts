import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createCard, getCard, markNumber } from '../controllers/cards.controller';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const createSchema = z.object({ sessionId: z.string() });
const markSchema = z.object({ number: z.number().min(1).max(75) });

router.post('/', requireAuth, validateBody(createSchema), createCard);
router.get('/:cardId', requireAuth, getCard);
router.post('/:cardId/mark', requireAuth, validateBody(markSchema), markNumber);

export default router;
