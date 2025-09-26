import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
// import { request } from 'http';

export async function register(req: Request, res: Response) {
  try {
    console.log(req);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    const user = await authService.registerUser(name, email, password);
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password are required' });

    const user = await authService.authenticateUser(email, password);
    const accessToken = authService.signAccessToken(user._id, user.isAdmin);
    const refreshToken = authService.signRefreshToken(user._id);

    res.json({ success: true, data: { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } } });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
}
