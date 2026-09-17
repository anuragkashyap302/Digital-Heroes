import crypto from 'crypto';
import { DRAW_CONSTANTS } from '../../constants/drawConstants.js';

export class RandomDrawStrategy {
  /**
   * Generates 5 unique random winning numbers between 1 and 45 using cryptographic randomness
   */
  static generateNumbers() {
    const numbersSet = new Set();
    
    while (numbersSet.size < 5) {
      // crypto.randomInt is cryptographically secure: min inclusive (1), max exclusive (46)
      const randomNum = crypto.randomInt(DRAW_CONSTANTS.MIN_SCORE, DRAW_CONSTANTS.MAX_SCORE + 1);
      numbersSet.add(randomNum);
    }

    return Array.from(numbersSet).sort((a, b) => a - b);
  }
}
