import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  isAdmin?: boolean;
  email?: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, error: 'No token' });
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ success: false, error: 'Malformed token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const p = (req as any).user as AuthPayload | undefined;
  if (!p || !p.isAdmin) return res.status(403).json({ success: false, error: 'Admin only' });
  next();
}
