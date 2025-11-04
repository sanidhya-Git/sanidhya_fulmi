import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

export async function registerUser(name: string, email: string, password: string): Promise<IUser> {
  if (!name || !email || !password) throw new Error('Name, email and password are required');

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists with this email');

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "user"
  });

  await user.save();
  return user;
}

export async function registerAdminUser(name: string, email: string, password: string): Promise<IUser> {
  if (!name || !email || !password) throw new Error('Name, email and password are required');

  const existing = await User.findOne({ email });
  if (existing) throw new Error('Admin already exists with this email');

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "admin"
  });

  await admin.save();
  return admin;
}

export async function authenticateUser(email: string, password: string): Promise<IUser> {
  if (!email || !password) throw new Error('Email and password are required');

  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  return user;
}

// Convert time strings to seconds for JWT
function parseTimeToSeconds(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid time format: ${timeStr}. Use formats like '15m', '7d', '1h'`);
  
  const [, num, unit] = match;
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(num, 10) * multipliers[unit];
}

export function signAccessToken(userId: Types.ObjectId | string, role: string): string {
  const payload = { userId: String(userId), isAdmin: role === "admin" };
  const secret: Secret = process.env.JWT_SECRET as string;

  const expiresIn = process.env.JWT_EXPIRES_IN
    ? parseTimeToSeconds(process.env.JWT_EXPIRES_IN)
    : 900; // 15 minutes

  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(userId: Types.ObjectId | string): string {
  const payload = { userId: String(userId) };
  const secret: Secret = process.env.REFRESH_TOKEN_SECRET as string;

  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN
    ? parseTimeToSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN)
    : 604800; // 7 days

  return jwt.sign(payload, secret, { expiresIn });
}
