import ClaimModel from '../models/Claim';
import BingoCardModel from '../models/BingoCard';
import GameSessionModel from '../models/GameSession';
import AdminSettingsModel from '../models/AdminSettings';
import UserModel from '../models/User';
import { checkPattern } from '../utils/patternChecker';
import { generate6DigitToken } from '../utils/token';
import { sendClaimEmail } from './email.service';
import mongoose from 'mongoose';

export async function createClaim(userId: string, cardId: string, pattern: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const card = await BingoCardModel.findOne({ cardId }).session(session);
    if (!card) throw new Error('Card not found');
    if (String(card.userId) !== userId) throw new Error('Card does not belong to user');

    const game = await GameSessionModel.findById(card.sessionId).session(session);
    if (!game) throw new Error('Session not found');

    const { matched, coords } = checkPattern(card.grid, pattern);

    let settings = await AdminSettingsModel.findOne().session(session);
    if (!settings) {
      settings = await AdminSettingsModel.create([{ maxClaimsPerPattern: {}, remainingClaimsPerPattern: {}, cardsPerUserDefault: 1 }], { session });
      // @ts-ignore
      settings = settings[0];
    }

    const remMap = settings.remainingClaimsPerPattern || new Map<string, number>();
    const maxMap = settings.maxClaimsPerPattern || new Map<string, number>();
    const maxForPattern = maxMap.get(pattern) as unknown as number | undefined;
    let remainingForPattern = remMap.get(pattern) as unknown as number | undefined;

    if (typeof maxForPattern === 'number' && typeof remainingForPattern === 'undefined') {
      remainingForPattern = maxForPattern;
      settings.remainingClaimsPerPattern.set(pattern, remainingForPattern);
      await settings.save({ session });
    }

    if (typeof remainingForPattern === 'number' && remainingForPattern <= 0) {
      throw new Error('No remaining claims available for this pattern');
    }

    const token = matched ? generate6DigitToken() : undefined;

    const claimDocs = await ClaimModel.create([{
      cardId: card._id,
      userId: card.userId,
      sessionId: game._id,
      pattern,
      valid: Boolean(matched),
      token
    }], { session });

    if (matched && typeof remainingForPattern === 'number') {
      settings.remainingClaimsPerPattern.set(pattern, remainingForPattern - 1);
      await settings.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    const createdClaim = claimDocs[0];

    if (matched) {
      const user = await UserModel.findById(userId);
      if (user) {
        await sendClaimEmail(user.email, {
          cardId: card.cardId,
          claimId: String(createdClaim._id),
          token: String(token),
          pattern,
          sessionId: String(game._id)
        });
      }
    }

    return { claim: createdClaim, matched, coords };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
