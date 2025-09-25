import { shuffle } from './utilsHelpers';
import { generateCardId } from './token';

export function generateCardGrid(freeCenter = true) {
  const ranges = [
    [1, 15], [16, 30], [31, 45], [46, 60], [61, 75]
  ];

  const columns: number[][] = ranges.map(([s, e]) => {
    const nums = Array.from({ length: e - s + 1 }, (_, i) => i + s);
    return shuffle(nums).slice(0, 5);
  });

  const rows = Array.from({ length: 5 }, (_, r) =>
    columns.map(col => ({ number: col[r], marked: false }))
  );

  if (freeCenter) rows[2][2].marked = true;

  return { cardId: generateCardId(), grid: rows };
}
