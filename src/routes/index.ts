import { Router } from 'express';
import authRouter from './auth';
import sessionsRouter from './sessions';
import cardsRouter from './cards';
import claimsRouter from './claims';
import adminRouter from './admin';

const router = Router();

router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/cards', cardsRouter);
router.use('/claims', claimsRouter);
router.use('/admin', adminRouter);

export default router;
