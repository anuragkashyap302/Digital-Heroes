import crypto from 'crypto';
import { DRAW_CONSTANTS } from '../../constants/drawConstants.js';

export class WeightedDrawStrategy {
  /**
   * Generates 5 unique winning numbers weighted by the frequency distribution of entered scores
   * @param {Array<number>} allSubscriberScores - Combined array of all valid scores recorded by active subscribers
   */
  static generateNumbers(allSubscriberScores = []) {
    // 1. Build frequency table for numbers 1 to 45
    const frequencyMap = new Map();
    for (let i = DRAW_CONSTANTS.MIN_SCORE; i <= DRAW_CONSTANTS.MAX_SCORE; i++) {
      frequencyMap.set(i, 1); // Baseline pseudo-count of 1 for uniform smoothing
    }

    allSubscriberScores.forEach(score => {
      if (score >= DRAW_CONSTANTS.MIN_SCORE && score <= DRAW_CONSTANTS.MAX_SCORE) {
        frequencyMap.set(score, (frequencyMap.get(score) || 1) + 1);
      }
    });

    const selectedNumbers = new Set();
    const availableNumbers = Array.from(frequencyMap.keys());

    while (selectedNumbers.size < 5 && availableNumbers.length > 0) {
      // Calculate total weight of remaining available numbers
      const totalWeight = availableNumbers.reduce((sum, num) => sum + frequencyMap.get(num), 0);
      
      // Random threshold using secure crypto
      const randomThreshold = crypto.randomInt(0, totalWeight);
      
      let cumulativeWeight = 0;
      let chosenNumber = availableNumbers[0];

      for (const num of availableNumbers) {
        cumulativeWeight += frequencyMap.get(num);
        if (randomThreshold < cumulativeWeight) {
          chosenNumber = num;
          break;
        }
      }

      selectedNumbers.add(chosenNumber);
      
      // Remove chosen number from candidates to guarantee uniqueness
      const index = availableNumbers.indexOf(chosenNumber);
      if (index > -1) {
        availableNumbers.splice(index, 1);
      }
    }

    return Array.from(selectedNumbers).sort((a, b) => a - b);
  }
}
