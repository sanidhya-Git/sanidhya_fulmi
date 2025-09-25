import BingoCardModel from '../models/BingoCard';
import { generateCardGrid } from '../utils/generateCard';
import { Types } from 'mongoose';

export async function createCardForUser(userId: string, sessionId: string) {
  const { cardId, grid } = generateCardGrid(true);
  const doc = await BingoCardModel.create({
    userId: new Types.ObjectId(userId),
    sessionId: new Types.ObjectId(sessionId),
    cardId,
    grid
  });
  return doc;
}

export async function getCardById(idOrCardId: string) {
  let doc = await BingoCardModel.findOne({ cardId: idOrCardId }).lean();
  if (!doc) doc = await BingoCardModel.findById(idOrCardId).lean();
  return doc;
}

export async function markNumberOnCard(cardId: string, number: number) {
  const card = await BingoCardModel.findOne({ cardId });
  if (!card) throw new Error('Card not found');
  for (let r = 0; r < card.grid.length; r++) {
    for (let c = 0; c < card.grid[r].length; c++) {
      if (card.grid[r][c].number === number) {
        card.grid[r][c].marked = true;
        await card.save();
        return card;
      }
    }
  }
  throw new Error('Number not on card');
}
