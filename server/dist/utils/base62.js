"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase62 = void 0;
const BASE62_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const encodeBase62 = (num) => {
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
exports.encodeBase62 = encodeBase62;
