
export function getRandomNumbers(count: number, min = 1, max = 75): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}
