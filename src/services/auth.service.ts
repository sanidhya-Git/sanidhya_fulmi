import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import ms from 'ms';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

export async function registerUser(name: string, email: string, password: string): Promise<IUser> {
  if (!name || !email || !password) throw new Error('Name, email and password are required');

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists with this email');

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });
  await user.save();
  return user;
}

export async function authenticateUser(email: string, password: string): Promise<IUser> {
  if (!email || !password) throw new Error('Email and password are required');

  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  return user;
}

function getExpiresInSeconds(envVar: string | undefined, fallback: string): number {
  const value = envVar || fallback;
  const milliseconds = ms(value);
  
  if (milliseconds === undefined) {
    throw new Error(`Invalid time format: ${value}. Use formats like '15m', '7d', '1h'`);
  }
  
  return Math.floor(milliseconds / 1000);
}

export function signAccessToken(userId: Types.ObjectId | string, isAdmin = false): string {
  const payload = { userId: String(userId), isAdmin };
  const secret: Secret = process.env.JWT_SECRET as string;

  return jwt.sign(payload, secret, {
    expiresIn: getExpiresInSeconds(process.env.JWT_EXPIRES_IN, '15m'),
  });
}

export function signRefreshToken(userId: Types.ObjectId | string): string {
  const payload = { userId: String(userId) };
  const secret: Secret = process.env.REFRESH_TOKEN_SECRET as string;

  return jwt.sign(payload, secret, {
    expiresIn: getExpiresInSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d'),
  });
}