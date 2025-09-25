import { Request, Response } from 'express';
import * as sessionService from '../services/session.service';
import GameSession from '../models/GameSession';

export async function createSession(req: Request, res: Response) {
  const { name, cardGenerationAmount } = req.body;
  try {
    const s = await sessionService.createSession(name, cardGenerationAmount || 1);
    res.status(201).json({ success: true, data: s });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function startSession(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const s = await GameSession.findByIdAndUpdate(id, { status: 'running' }, { new: true });
    if (!s) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: s });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function callNumber(req: Request, res: Response) {
  const id = req.params.id;
  const { number } = req.body;
  try {
    const called = await sessionService.callNumber(id, number);
    res.json({ success: true, data: called });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
