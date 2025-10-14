import { Router } from 'express';
import authRouter from './auth';
import sessionsRouter from './sessions';
import cardsRouter from './cards';
import claimsRouter from './claims';
import adminRouter from './admin';
import backgroundRoutes from "./background";

const router = Router();

router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/cards', cardsRouter);
router.use('/claims', claimsRouter);
router.use('/admin', adminRouter);
router.use("/backgrounds", backgroundRoutes);

export default router;
