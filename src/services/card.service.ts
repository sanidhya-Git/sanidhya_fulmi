import BingoCard from "../models/BingoCard";
import { generateBingoCard } from "../utils/generateCard";

export async function generateCardsForAdmin(count: number) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const newCard = generateBingoCard();
    cards.push(newCard);
  }
  await BingoCard.insertMany(cards);
  return cards.length;
}

export async function assignCardsToUser(userId: string, numberOfCards: number) {
  const available = await BingoCard.find({ assignedToUserId: null })
    .limit(numberOfCards)
    .lean();

  if (available.length < numberOfCards)
    throw new Error("Not enough available cards. Ask admin to generate more.");

  const cardIds = available.map((c) => c._id);

  await BingoCard.updateMany(
    { _id: { $in: cardIds } },
    { $set: { assignedToUserId: userId, assignedAt: new Date() } }
  );

  const assignedCards = await BingoCard.find({ _id: { $in: cardIds } });
  return assignedCards;
}
