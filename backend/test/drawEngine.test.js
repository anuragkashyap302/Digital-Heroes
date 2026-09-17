import test from 'node:test';
import assert from 'node:assert/strict';
import { RandomDrawStrategy } from '../src/services/draw/RandomDrawStrategy.js';
import { WeightedDrawStrategy } from '../src/services/draw/WeightedDrawStrategy.js';
import { PrizeCalculator } from '../src/services/draw/PrizeCalculator.js';
import { WinnerCalculator } from '../src/services/draw/WinnerCalculator.js';

test('RandomDrawStrategy: Generates 5 unique numbers within 1-45', () => {
  for (let i = 0; i < 50; i++) {
    const numbers = RandomDrawStrategy.generateNumbers();
    assert.equal(numbers.length, 5);
    const uniqueSet = new Set(numbers);
    assert.equal(uniqueSet.size, 5);

    numbers.forEach(num => {
      assert.ok(num >= 1 && num <= 45, `Number ${num} must be between 1 and 45`);
    });
  }
});

test('WeightedDrawStrategy: Generates 5 unique numbers adhering to frequencies', () => {
  const mockSubscriberScores = [36, 36, 36, 38, 38, 42, 42, 42, 42, 28];
  const numbers = WeightedDrawStrategy.generateNumbers(mockSubscriberScores);

  assert.equal(numbers.length, 5);
  const uniqueSet = new Set(numbers);
  assert.equal(uniqueSet.size, 5);

  numbers.forEach(num => {
    assert.ok(num >= 1 && num <= 45);
  });
});

test('PrizeCalculator: 40% Tier-1, 35% Tier-2, 25% Tier-3, Rollovers and Configurable Pool', () => {
  // Scenario: £20,000 subscriber revenue, 50% pool ratio (£10,000 prize pool), £2,000 previous rollover
  const result = PrizeCalculator.calculatePools({
    totalSubscriberRevenue: 20000,
    previousRollover: 2000,
    customPrizePoolPercentage: 0.50
  });

  assert.equal(result.periodPrizeRevenue, 10000);
  assert.equal(result.prizePoolTotal, 12000); // £10,000 current + £2,000 previous rollover

  // Tier 1 (5-match) = 40% of £10k + £2,000 rollover = £6,000
  assert.equal(result.pool5Match, 6000);

  // Tier 2 (4-match) = 35% of £10k = £3,500
  assert.equal(result.pool4Match, 3500);

  // Tier 3 (3-match) = 25% of £10k = £2,500
  assert.equal(result.pool3Match, 2500);

  // Minimum Charity = 10% of £20,000 = £2,000
  assert.equal(result.charityDistributionTotal, 2000);

  // Test Rollover Calculation
  // 1. If 0 Tier-5 winners, the entire Tier-5 pool (£6,000) rolls over to next draw
  const rolloverUnclaimed = PrizeCalculator.computeNextRollover(result.pool5Match, 0);
  assert.equal(rolloverUnclaimed, 6000);

  // 2. If 1 or more Tier-5 winners, rollover to next draw is 0
  const rolloverClaimed = PrizeCalculator.computeNextRollover(result.pool5Match, 1);
  assert.equal(rolloverClaimed, 0);
});

test('WinnerCalculator: Match counting (5, 4, 3) and Equal Prize Splitting', () => {
  const winningNumbers = [10, 20, 30, 40, 45];

  const eligibleEntries = [
    // Winner 1: 5-number match (Tier 1)
    { userId: 'user-1', fullName: 'Jack Nicklaus', email: 'jack@golf.com', entryNumbers: [10, 20, 30, 40, 45] },
    // Winner 2: 4-number match (Tier 2)
    { userId: 'user-2', fullName: 'Tiger Woods', email: 'tiger@golf.com', entryNumbers: [10, 20, 30, 40, 15] },
    // Winner 3: 4-number match (Tier 2)
    { userId: 'user-3', fullName: 'Rory McIlroy', email: 'rory@golf.com', entryNumbers: [10, 20, 30, 40, 18] },
    // Winner 4: 3-number match (Tier 3)
    { userId: 'user-4', fullName: 'Ben Hogan', email: 'ben@golf.com', entryNumbers: [10, 20, 30, 12, 14] },
    // Non-winner: 2-number match
    { userId: 'user-5', fullName: 'Sam Snead', email: 'sam@golf.com', entryNumbers: [10, 20, 11, 12, 14] }
  ];

  const pools = {
    pool5Match: 4000.00,
    pool4Match: 3500.00,
    pool3Match: 2500.00
  };

  const results = WinnerCalculator.calculateWinners(winningNumbers, eligibleEntries, pools);

  assert.equal(results.summary.tier5Count, 1);
  assert.equal(results.summary.tier4Count, 2);
  assert.equal(results.summary.tier3Count, 1);
  assert.equal(results.summary.totalWinnersCount, 4);

  // Check equal split:
  // Tier 1: 1 winner gets all £4,000
  const tier5Winner = results.allWinners.find(w => w.userId === 'user-1');
  assert.equal(tier5Winner.prizeAmount, 4000.00);

  // Tier 2: 2 winners split £3,500 equally -> £1,750 each
  const tier4WinnerA = results.allWinners.find(w => w.userId === 'user-2');
  const tier4WinnerB = results.allWinners.find(w => w.userId === 'user-3');
  assert.equal(tier4WinnerA.prizeAmount, 1750.00);
  assert.equal(tier4WinnerB.prizeAmount, 1750.00);

  // Tier 3: 1 winner gets all £2,500
  const tier3Winner = results.allWinners.find(w => w.userId === 'user-4');
  assert.equal(tier3Winner.prizeAmount, 2500.00);
});
