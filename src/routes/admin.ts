import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getUsers, getWinners, updateSettings } from '../controllers/admin.controller';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const settingsSchema = z.object({
  maxClaimsPerPattern: z.record(z.string(), z.number()).optional(),
  cardsPerUserDefault: z.number().optional()
});

router.use(requireAuth, requireAdmin);

router.get('/users', getUsers);
router.get('/winners', getWinners);
router.post('/settings', validateBody(settingsSchema), updateSettings);

export default router;
