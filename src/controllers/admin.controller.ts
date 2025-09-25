import { Request, Response } from 'express';
import UserModel from '../models/User';
import ClaimModel from '../models/Claim';
import AdminSettingsModel from '../models/AdminSettings';

export async function getUsers(_req: Request, res: Response) {
  const users = await UserModel.find().lean();
  res.json({ success: true, data: users });
}

export async function getWinners(_req: Request, res: Response) {
  const winners = await ClaimModel.find({ valid: true }).populate('userId', 'email').populate('cardId', 'cardId').lean();
  res.json({ success: true, data: winners });
}

export async function updateSettings(req: Request, res: Response) {
  const payload = req.body;
  const settings = await AdminSettingsModel.findOneAndUpdate({}, payload, { upsert: true, new: true });
  res.json({ success: true, data: settings });
}
