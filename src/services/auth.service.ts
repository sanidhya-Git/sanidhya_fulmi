import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

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

export function signAccessToken(userId: Types.ObjectId | string, isAdmin = false) {
  const payload = { userId: String(userId), isAdmin };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

export function signRefreshToken(userId: Types.ObjectId | string) {
  return jwt.sign({ userId: String(userId) }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
}
