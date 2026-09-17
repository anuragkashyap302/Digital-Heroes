export class WinnerCalculator {
  /**
   * Matches subscriber 5-score combinations against winning numbers and calculates equal tier splits
   * @param {Array<number>} winningNumbers - Array of 5 winning integers
   * @param {Array<Object>} eligibleEntries - Array of subscriber entries: [{ userId, fullName, email, entryNumbers: [n1,n2,n3,n4,n5] }]
   * @param {Object} pools - { pool5Match, pool4Match, pool3Match }
   */
  static calculateWinners(winningNumbers, eligibleEntries = [], pools = {}) {
    const winningSet = new Set(winningNumbers);

    const evaluatedEntries = eligibleEntries.map(entry => {
      // Find matching numbers
      const matchedNumbers = entry.entryNumbers.filter(num => winningSet.has(num));
      const matchCount = matchedNumbers.length;

      let tierWon = 'none';
      if (matchCount === 5) tierWon = 'tier_5';
      else if (matchCount === 4) tierWon = 'tier_4';
      else if (matchCount === 3) tierWon = 'tier_3';

      return {
        userId: entry.userId,
        fullName: entry.fullName,
        email: entry.email,
        entryNumbers: entry.entryNumbers,
        matchedCount: matchCount,
        matchedNumbers: matchedNumbers.sort((a, b) => a - b),
        tierWon,
        prizeAmount: 0.00
      };
    });

    // Group winners by tier
    const tier5Winners = evaluatedEntries.filter(e => e.tierWon === 'tier_5');
    const tier4Winners = evaluatedEntries.filter(e => e.tierWon === 'tier_4');
    const tier3Winners = evaluatedEntries.filter(e => e.tierWon === 'tier_3');

    // Split tier prize pools equally among winners in each tier (PRD requirement)
    if (tier5Winners.length > 0 && pools.pool5Match > 0) {
      const splitAmount = Math.round((pools.pool5Match / tier5Winners.length) * 100) / 100;
      tier5Winners.forEach(w => { w.prizeAmount = splitAmount; });
    }

    if (tier4Winners.length > 0 && pools.pool4Match > 0) {
      const splitAmount = Math.round((pools.pool4Match / tier4Winners.length) * 100) / 100;
      tier4Winners.forEach(w => { w.prizeAmount = splitAmount; });
    }

    if (tier3Winners.length > 0 && pools.pool3Match > 0) {
      const splitAmount = Math.round((pools.pool3Match / tier3Winners.length) * 100) / 100;
      tier3Winners.forEach(w => { w.prizeAmount = splitAmount; });
    }

    const allWinners = [...tier5Winners, ...tier4Winners, ...tier3Winners];

    return {
      evaluatedEntries,
      allWinners,
      summary: {
        totalEvaluated: evaluatedEntries.length,
        tier5Count: tier5Winners.length,
        tier4Count: tier4Winners.length,
        tier3Count: tier3Winners.length,
        totalWinnersCount: allWinners.length,
        tier5IndividualPrize: tier5Winners.length > 0 ? tier5Winners[0].prizeAmount : 0,
        tier4IndividualPrize: tier4Winners.length > 0 ? tier4Winners[0].prizeAmount : 0,
        tier3IndividualPrize: tier3Winners.length > 0 ? tier3Winners[0].prizeAmount : 0
      }
    };
  }
}
