import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env"; // ensure you export JWT_SECRET from config/env

export interface AuthPayload extends JwtPayload {
  userId: string;
  isAdmin: boolean;
  email?: string;
}

// Middleware to verify any authenticated user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, error: "Invalid token format" });
  }

  try {
    if (!JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment");
      return res.status(500).json({ success: false, error: "Server misconfiguration" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // ✅ attach the decoded payload to the request object
    (req as any).user = payload;

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
}

// Middleware to restrict access to admin users only
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthPayload | undefined;

  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!user.isAdmin) {
    return res.status(403).json({ success: false, error: "Admin only" });
  }

  next();
}
