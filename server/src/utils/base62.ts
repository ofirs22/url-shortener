const BASE62_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const encodeBase62 = (num: number): string => {
  let encoded = '';
  const base = BASE62_CHARACTERS.length;

  while (num > 0) {
    const remainder = num % base;
    encoded = BASE62_CHARACTERS[remainder] + encoded;
    num = Math.floor(num / base);
  }

  // Pad with leading characters to ensure the length is 7
  return encoded.padStart(7, BASE62_CHARACTERS[0]);
};