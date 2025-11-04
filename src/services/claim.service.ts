import mongoose from "mongoose";
import ClaimModel from "../models/Claim";
import BingoCardModel from "../models/BingoCard";
import GameSessionModel from "../models/GameSession";
import AdminSettingsModel from "../models/AdminSettings";
import UserModel from "../models/User";
import { checkPattern } from "../utils/patternChecker";
import { generate6DigitToken } from "../utils/token";
import { sendClaimEmail } from "./email.service";

/**
 * Create a new claim for a given user, card, and pattern
 */
export async function createClaim(
  userId: string,
  cardId: string,
  pattern: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Fetch bingo card
    const card = await BingoCardModel.findOne({ cardId }).session(session);
    if (!card) throw new Error("Card not found");
    if (String(card.userId) !== String(userId))
      throw new Error("Card does not belong to user");

    // ✅ Fetch game session
    const game = await GameSessionModel.findById(card.sessionId).session(
      session
    );
    if (!game) throw new Error("Session not found");

    // ✅ Check pattern (ensure board type matches)
    const { matched, coords } = checkPattern(
      card.board as any[][], // in case board is number[][]
      pattern
    );

    // ✅ Get or create admin settings
    let settings = await AdminSettingsModel.findOne().session(session);
    if (!settings) {
      settings = new AdminSettingsModel({
        maxClaimsPerPattern: new Map<string, number>(),
        remainingClaimsPerPattern: new Map<string, number>(),
        cardsPerUserDefault: 1,
      });
      await settings.save({ session });
    }

    const remMap = settings.remainingClaimsPerPattern!;
    const maxMap = settings.maxClaimsPerPattern!;

    const maxForPattern = maxMap.get(pattern);
    let remainingForPattern = remMap.get(pattern);

    // Initialize remaining claims if not present
    if (typeof maxForPattern === "number" && remainingForPattern === undefined) {
      remainingForPattern = maxForPattern;
      settings.remainingClaimsPerPattern.set(pattern, remainingForPattern);
      await settings.save({ session });
    }

    // Check if any claims left for this pattern
    if (typeof remainingForPattern === "number" && remainingForPattern <= 0)
      throw new Error("No remaining claims available for this pattern");

    // Generate claim token if matched
    const token = matched ? generate6DigitToken() : undefined;

    // ✅ Create claim document
    const [createdClaim] = await ClaimModel.create(
      [
        {
          cardId: card._id,
          userId: card.userId,
          sessionId: game._id,
          pattern,
          valid: Boolean(matched),
          token,
        },
      ],
      { session }
    );

    // ✅ Decrement remaining claims if valid claim
    if (matched && typeof remainingForPattern === "number") {
      settings.remainingClaimsPerPattern.set(pattern, remainingForPattern - 1);
      await settings.save({ session });
    }

    await session.commitTransaction();

    // ✅ Send claim email if matched
    if (matched) {
      const user = await UserModel.findById(userId);
      if (user) {
        await sendClaimEmail(user.email, {
          cardId: card.cardId,
          claimId: String(createdClaim._id),
          token: String(token),
          pattern,
          sessionId: String(game._id),
        });
      }
    }

    return { claim: createdClaim, matched, coords };
  } catch (err) {
    await session.abortTransaction();
    console.error("Claim creation failed:", err);
    throw err;
  } finally {
    session.endSession();
  }
}
