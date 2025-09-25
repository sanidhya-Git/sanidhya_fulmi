import GameSession from '../models/GameSession';

export async function createSession(name: string, cardGenerationAmount = 1) {
  const s = await GameSession.create({ name, cardGenerationAmount });
  return s;
}

export async function callNumber(sessionId: string, number: number) {
  const s = await GameSession.findById(sessionId);
  if (!s) throw new Error('Session not found');
  if (s.calledNumbers.includes(number)) throw new Error('Number already called');
  s.calledNumbers.push(number);
  await s.save();
  return s.calledNumbers;
}
