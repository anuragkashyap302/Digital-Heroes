/**
 * DIGITAL HEROES - Draw & Business Logic Constants
 * All configurable parameters are isolated here.
 */

export const DRAW_CONSTANTS = {
  // Configurable prize pool percentage from subscription revenue (PRD Ambiguity: Level 1 Assumption)
  DEFAULT_PRIZE_POOL_PERCENTAGE: parseFloat(process.env.PRIZE_POOL_PERCENTAGE || '0.50'),

  // Minimum charity percentage enforced on all subscriptions
  MIN_CHARITY_PERCENTAGE: parseFloat(process.env.MIN_CHARITY_PERCENTAGE || '10.00'),

  // Prize Tier Allocation Percentages (PRD Explicit Requirement)
  // 5-match: 40% (Rolls over if unclaimed)
  // 4-match: 35% (Split equally, no rollover)
  // 3-match: 25% (Split equally, no rollover)
  TIER_5_PERCENTAGE: 0.40,
  TIER_4_PERCENTAGE: 0.35,
  TIER_3_PERCENTAGE: 0.25,

  // Stableford Score Rules
  MIN_SCORE: 1,
  MAX_SCORE: 45,
  MAX_RETAINED_SCORES: 5,

  // Draw Modes
  MODES: {
    RANDOM_LOTTERY: 'random_lottery',
    ALGORITHMIC_FREQUENCY: 'algorithmic_frequency'
  },

  // Draw Statuses
  STATUSES: {
    DRAFT: 'draft',
    SIMULATED: 'simulated',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },

  // Proof Statuses
  PROOF_STATUSES: {
    PENDING_UPLOAD: 'pending_upload',
    UNDER_REVIEW: 'under_review',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },

  // Payout Statuses
  PAYOUT_STATUSES: {
    PENDING: 'pending',
    PAID: 'paid'
  }
};
