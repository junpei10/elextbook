export const unigramFactory = (word: string): string[] => {
  const _word = word.replace(/\s+/g, '');
  return [...new Set(_word.split(''))];
};

export function ngram(n: number, word: string): string[] {
  const _word = word.replace(/\s+/g, '');
  const result = [];
  const len = _word.length;
  for (let i = 0; i <= len - n; i++) {
    result.push(_word.substring(i, i + n));
  }
  return [...new Set(result)];
}
