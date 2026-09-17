import { DRAW_CONSTANTS } from '../../constants/drawConstants.js';
import { ENV } from '../../config/env.js';

export class PrizeCalculator {
  /**
   * Calculates total prize pool, tier splits, and charity distributions
   * @param {number} totalSubscriberRevenue - Total active subscriber subscription revenue for the draw period
   * @param {number} previousRollover - Rollover amount from previous draw's unclaimed Tier 5 pool
   * @param {number} customPrizePoolPercentage - Optional override for prize pool percentage (default from ENV/constants)
   */
  static calculatePools({
    totalSubscriberRevenue = 0,
    previousRollover = 0,
    customPrizePoolPercentage = null
  }) {
    const poolRatio = customPrizePoolPercentage !== null ? customPrizePoolPercentage : ENV.PRIZE_POOL_PERCENTAGE;
    
    // Revenue allocated to the active prize pool
    const periodPrizeRevenue = totalSubscriberRevenue * poolRatio;
    
    // Minimum 10% charity distribution from subscription revenue
    const charityDistributionTotal = totalSubscriberRevenue * (DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE / 100);

    // Total Prize Pool (Current revenue portion + Previous Tier-5 rollover)
    const prizePoolTotal = periodPrizeRevenue + previousRollover;

    // Tier Splits (PRD Requirement):
    // 5-match: 40% of period revenue + previous rollover
    // 4-match: 35% of period revenue
    // 3-match: 25% of period revenue
    const pool5Match = (periodPrizeRevenue * DRAW_CONSTANTS.TIER_5_PERCENTAGE) + previousRollover;
    const pool4Match = periodPrizeRevenue * DRAW_CONSTANTS.TIER_4_PERCENTAGE;
    const pool3Match = periodPrizeRevenue * DRAW_CONSTANTS.TIER_3_PERCENTAGE;

    return {
      totalSubscriberRevenue: Math.round(totalSubscriberRevenue * 100) / 100,
      prizePoolRatio: poolRatio,
      periodPrizeRevenue: Math.round(periodPrizeRevenue * 100) / 100,
      previousRollover: Math.round(previousRollover * 100) / 100,
      prizePoolTotal: Math.round(prizePoolTotal * 100) / 100,
      pool5Match: Math.round(pool5Match * 100) / 100,
      pool4Match: Math.round(pool4Match * 100) / 100,
      pool3Match: Math.round(pool3Match * 100) / 100,
      charityDistributionTotal: Math.round(charityDistributionTotal * 100) / 100
    };
  }

  /**
   * Computes rollover amount to carry forward to next draw based on whether Tier 5 was won
   * @param {number} pool5Match - Total Tier 5 pool in this draw
   * @param {number} tier5WinnerCount - Number of winners who matched all 5 numbers
   */
  static computeNextRollover(pool5Match, tier5WinnerCount) {
    if (tier5WinnerCount === 0) {
      // 5-number jackpot rolls over if unclaimed (PRD Explicit Rule)
      return Math.round(pool5Match * 100) / 100;
    }
    // Claimed! No rollover to next draw
    return 0.00;
  }
}
