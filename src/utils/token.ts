import crypto from 'crypto';

export function generate6DigitToken(): string {
  const n = (crypto.randomInt(0, 1000000) + 1000000).toString().slice(1);
  return n;
}

export function generateCardId(): string {
  return crypto.randomBytes(6).toString('hex');
}
