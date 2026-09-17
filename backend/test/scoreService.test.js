import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreService } from '../src/services/scoreService.js';
import { mockDataStore } from '../src/config/db.js';

test('ScoreService: Stableford 1-45 Points Validation', async () => {
  const testUser = 'user-test-validation';

  // 1. Valid score within 1-45
  const resValid = await ScoreService.addScore(testUser, {
    score: 36,
    played_at: '2026-09-01',
    course_name: 'Test Links'
  });
  assert.equal(resValid.length, 1);
  assert.equal(resValid[0].score, 36);

  // 2. Score < 1 should throw error
  await assert.rejects(async () => {
    await ScoreService.addScore(testUser, { score: 0, played_at: '2026-09-02' });
  }, /between 1 and 45/);

  // 3. Score > 45 should throw error
  await assert.rejects(async () => {
    await ScoreService.addScore(testUser, { score: 46, played_at: '2026-09-02' });
  }, /between 1 and 45/);
});

test('ScoreService: Duplicate Date Constraint for same user', async () => {
  const testUser = 'user-test-duplicate-date';

  await ScoreService.addScore(testUser, {
    score: 34,
    played_at: '2026-09-05',
    course_name: 'Test Club'
  });

  // Second score on same date must throw 409 conflict
  await assert.rejects(async () => {
    await ScoreService.addScore(testUser, {
      score: 38,
      played_at: '2026-09-05',
      course_name: 'Different Club'
    });
  }, (err) => {
    assert.equal(err.statusCode, 409);
    return true;
  });
});

test('ScoreService: Transactional 5-Score FIFO Auto-Eviction Queue', async () => {
  const testUser = 'user-test-fifo';

  // Insert 5 scores chronologically
  await ScoreService.addScore(testUser, { score: 30, played_at: '2026-08-01', course_name: 'Round 1' });
  await ScoreService.addScore(testUser, { score: 32, played_at: '2026-08-05', course_name: 'Round 2' });
  await ScoreService.addScore(testUser, { score: 34, played_at: '2026-08-10', course_name: 'Round 3' });
  await ScoreService.addScore(testUser, { score: 36, played_at: '2026-08-15', course_name: 'Round 4' });
  const fiveScores = await ScoreService.addScore(testUser, { score: 38, played_at: '2026-08-20', course_name: 'Round 5' });

  assert.equal(fiveScores.length, 5);
  // Verify strictly reverse chronological order: 2026-08-20 is first, 2026-08-01 is last
  assert.equal(fiveScores[0].played_at, '2026-08-20');
  assert.equal(fiveScores[4].played_at, '2026-08-01');

  // Insert 6th score with newer date (2026-08-25)
  const sixScoresResult = await ScoreService.addScore(testUser, { score: 40, played_at: '2026-08-25', course_name: 'Round 6' });

  // Total count must remain capped at exactly 5
  assert.equal(sixScoresResult.length, 5);

  // Newest score (2026-08-25) should be at index 0
  assert.equal(sixScoresResult[0].played_at, '2026-08-25');
  assert.equal(sixScoresResult[0].score, 40);

  // Oldest score (2026-08-01 with score 30) must have been automatically dropped
  const hasOldest = sixScoresResult.some(s => s.played_at === '2026-08-01');
  assert.equal(hasOldest, false, 'Oldest score on 2026-08-01 must be auto-evicted');
});
