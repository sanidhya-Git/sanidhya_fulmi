import { Request, Response } from 'express';
import * as cardService from '../services/card.service';
import GameSession from '../models/GameSession';

export async function createCard(req: Request, res: Response) {
  const user = (req as any).user;
  const { sessionId } = req.body;
  try {
    const sessionObj = await GameSession.findById(sessionId);
    if (!sessionObj) return res.status(404).json({ success: false, error: 'Session not found' });

    const card = await cardService.createCardForUser(user.userId, sessionId);
    res.status(201).json({ success: true, data: card });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getCard(req: Request, res: Response) {
  const user = (req as any).user;
  const cardId = req.params.cardId;
  try {
    const card = await cardService.getCardById(cardId);
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' });
    if (String(card.userId) !== user.userId && !user.isAdmin) return res.status(403).json({ success: false, error: 'Forbidden' });
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function markNumber(req: Request, res: Response) {
  const user = (req as any).user;
  const cardId = req.params.cardId;
  const { number } = req.body;
  try {
    const card = await cardService.getCardById(cardId);
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' });
    if (String(card.userId) !== user.userId) return res.status(403).json({ success: false, error: 'Forbidden' });

    const session = await GameSession.findById(card.sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    if (!session.calledNumbers.includes(number)) return res.status(409).json({ success: false, error: 'Number not called yet' });

    const updated = await cardService.markNumberOnCard(card.cardId, number);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
