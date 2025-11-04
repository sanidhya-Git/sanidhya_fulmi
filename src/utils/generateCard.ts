export function generateBingoCard() {
  const columns = [
    Array.from({ length: 15 }, (_, i) => i + 1),
    Array.from({ length: 15 }, (_, i) => i + 16),
    Array.from({ length: 15 }, (_, i) => i + 31),
    Array.from({ length: 15 }, (_, i) => i + 46),
    Array.from({ length: 15 }, (_, i) => i + 61),
  ];

  const grid: number[][] = columns.map((col) => {
    const shuffled = col.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  // Transpose columns → rows
  const board = Array.from({ length: 5 }, (_, i) =>
    grid.map((col) => col[i])
  );

  // Free center space
  board[2][2] = 0;
  return board;
}
