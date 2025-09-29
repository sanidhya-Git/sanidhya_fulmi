export const generateBoard = (): number[][] => {
  const board: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const row: number[] = [];
    while (row.length < 5) {
      const num = Math.floor(Math.random() * 75) + 1;
      if (!row.includes(num)) row.push(num);
    }
    board.push(row);
  }
  return board;
};
