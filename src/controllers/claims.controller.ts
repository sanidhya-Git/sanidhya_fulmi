import { Request, Response } from 'express';
import * as claimService from '../services/claim.service';

export async function submitClaim(req: Request, res: Response) {
  const user = (req as any).user;
  const { cardId, pattern } = req.body;
  try {
    const result = await claimService.createClaim(user.userId, cardId, pattern);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
