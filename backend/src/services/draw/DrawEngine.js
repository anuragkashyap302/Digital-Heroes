import { RandomDrawStrategy } from './RandomDrawStrategy.js';
import { WeightedDrawStrategy } from './WeightedDrawStrategy.js';
import { PrizeCalculator } from './PrizeCalculator.js';
import { WinnerCalculator } from './WinnerCalculator.js';
import { DRAW_CONSTANTS } from '../../constants/drawConstants.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';

export class DrawEngine {
  /**
   * Gathers eligible subscribers and their 5 latest scores (Immutable snapshot source)
   * Level 1 Documented Eligibility Rule: Active subscriber with all 5 scores recorded.
   */
  static async getEligibleSubscribersWithScores() {
    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      // Query active subscribers
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('user_id, plan_type, status')
      let userIds = (activeSubs || []).map(s => s.user_id);
      
      if (userIds.length === 0) {
        const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email');
        if (allProfiles && allProfiles.length > 0) {
          userIds = allProfiles.map(p => p.id);
        } else {
          return { eligible: [], totalRevenue: 0, allScores: [] };
        }
      }
      
      // Query profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Query scores
      const { data: allScoresRaw } = await supabase
        .from('scores')
        .select('*')
        .in('user_id', userIds)
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false });

      // Group scores by user
      const userScoresMap = new Map();
      (allScoresRaw || []).forEach(sc => {
        if (!userScoresMap.has(sc.user_id)) userScoresMap.set(sc.user_id, []);
        if (userScoresMap.get(sc.user_id).length < 5) {
          userScoresMap.get(sc.user_id).push(sc.score);
        }
      });

      const eligible = [];
      const collectedScores = [];
      let totalRevenue = 0;

      activeSubs.forEach(sub => {
        const scores = userScoresMap.get(sub.user_id) || [];
        // Only eligible if user has completed all 5 scores
        if (scores.length === 5) {
          const prof = profileMap.get(sub.user_id) || { full_name: 'Subscriber', email: '' };
          eligible.push({
            userId: sub.user_id,
            fullName: prof.full_name,
            email: prof.email,
            entryNumbers: scores.slice(0, 5),
            planType: sub.plan_type
          });
          collectedScores.push(...scores);
          
          // Estimate monthly revenue contribution (£29/mo or £290/12/yr)
          const revenueEstimate = sub.plan_type.includes('yearly') ? 24.16 : 29.00;
          totalRevenue += revenueEstimate;
        }
      });

      return { eligible, totalRevenue, allScores: collectedScores };
    }

    // Mock Database Gatherer
    const activeSubs = mockDataStore.subscriptions.filter(s => s.status === 'active' && s.is_current);
    const eligible = [];
    const collectedScores = [];
    let totalRevenue = 0;

    activeSubs.forEach(sub => {
      const userScores = mockDataStore.scores
        .filter(s => s.user_id === sub.user_id)
        .sort((a, b) => new Date(b.played_at) - new Date(a.played_at) || new Date(b.created_at) - new Date(a.created_at));

      if (userScores.length === 5) {
        const userProfile = mockDataStore.profiles.find(p => p.id === sub.user_id) || { full_name: 'Subscriber', email: '' };
        const scoreNumbers = userScores.map(s => s.score);
        eligible.push({
          userId: sub.user_id,
          fullName: userProfile.full_name,
          email: userProfile.email,
          entryNumbers: scoreNumbers,
          planType: sub.plan_type
        });
        collectedScores.push(...scoreNumbers);
        const revenueEstimate = sub.plan_type.includes('yearly') ? 24.16 : 29.00;
        totalRevenue += revenueEstimate;
      }
    });

    return { eligible, totalRevenue, allScores: collectedScores };
  }

  /**
   * Run Draw Simulation without publishing or committing to state
   */
  static async simulateDraw({ drawId, mode = DRAW_CONSTANTS.MODES.RANDOM_LOTTERY, customPrizePool = null }) {
    const { eligible, totalRevenue, allScores } = await this.getEligibleSubscribersWithScores();

    // Get previous draw rollover
    let previousRollover = 0;
    const pastDraws = isMockDatabase()
      ? mockDataStore.draws.filter(d => d.status === 'published')
      : [];
    if (pastDraws.length > 0) {
      const lastDraw = pastDraws[pastDraws.length - 1];
      previousRollover = parseFloat(lastDraw.rollover_to_next || 0);
    }

    // Generate winning numbers based on strategy mode
    let winningNumbers = [];
    if (mode === DRAW_CONSTANTS.MODES.ALGORITHMIC_FREQUENCY) {
      winningNumbers = WeightedDrawStrategy.generateNumbers(allScores);
    } else {
      winningNumbers = RandomDrawStrategy.generateNumbers();
    }

    // Calculate pools
    const revenueToUse = customPrizePool ? customPrizePool / (DRAW_CONSTANTS.DEFAULT_PRIZE_POOL_PERCENTAGE || 0.5) : Math.max(totalRevenue, 20000);
    const pools = PrizeCalculator.calculatePools({
      totalSubscriberRevenue: revenueToUse,
      previousRollover,
      customPrizePoolPercentage: DRAW_CONSTANTS.DEFAULT_PRIZE_POOL_PERCENTAGE
    });

    // Evaluate winners
    const winnerResults = WinnerCalculator.calculateWinners(winningNumbers, eligible, pools);
    const nextRollover = PrizeCalculator.computeNextRollover(pools.pool5Match, winnerResults.summary.tier5Count);

    return {
      drawId,
      mode,
      status: 'simulated',
      winningNumbers,
      pools,
      nextRollover,
      eligibleCount: eligible.length,
      winnersSummary: winnerResults.summary,
      winners: winnerResults.allWinners,
      sampleEntries: winnerResults.evaluatedEntries.slice(0, 10),
      simulationTimestamp: new Date().toISOString()
    };
  }

  /**
   * Commit and Publish a Draw: Saves immutable snapshots and creates winner records
   */
  static async publishDraw({ drawId, mode, winningNumbers, pools, nextRollover, winners, eligibleEntries }) {
    const publishedAt = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      // 1. Update draw record
      const { data: updatedDraw, error: drawErr } = await supabase
        .from('draws')
        .update({
          mode,
          status: 'published',
          winning_numbers: winningNumbers,
          total_subscribers_eligible: eligibleEntries ? eligibleEntries.length : 0,
          prize_pool_total: pools.prizePoolTotal,
          rollover_from_previous: pools.previousRollover,
          rollover_to_next: nextRollover,
          pool_5_match: pools.pool5Match,
          pool_4_match: pools.pool4Match,
          pool_3_match: pools.pool3Match,
          charity_distribution_total: pools.charityDistributionTotal,
          published_at: publishedAt
        })
        .eq('id', drawId)
        .select()
        .single();

      if (drawErr) throw drawErr;

      // 2. Insert immutable draw entries
      if (eligibleEntries && eligibleEntries.length > 0) {
        const entriesToInsert = eligibleEntries.map(e => ({
          draw_id: drawId,
          user_id: e.userId,
          entry_numbers: e.entryNumbers,
          matched_count: e.matchedCount || 0,
          matched_numbers: e.matchedNumbers || [],
          tier_won: e.tierWon || 'none',
          prize_amount: e.prizeAmount || 0,
          is_snapshot_immutable: true
        }));
        await supabase.from('draw_entries').insert(entriesToInsert);
      }

      // 3. Insert winner records (pending upload)
      if (winners && winners.length > 0) {
        const winnersToInsert = winners.map(w => ({
          draw_id: drawId,
          user_id: w.userId,
          tier: w.tierWon,
          match_count: w.matchedCount,
          prize_amount: w.prizeAmount,
          proof_status: 'pending_upload',
          payout_status: 'pending'
        }));
        await supabase.from('winners').insert(winnersToInsert);
      }

      return updatedDraw;
    }

    // Mock Store Publish
    let drawIndex = mockDataStore.draws.findIndex(d => d.id === drawId);
    if (drawIndex === -1) {
      const newDraw = {
        id: drawId || `draw-${Date.now()}`,
        draw_number: mockDataStore.draws.length + 101,
        name: `Digital Heroes Impact Draw #${mockDataStore.draws.length + 101}`,
        draw_date: publishedAt,
        mode,
        status: 'published',
        winning_numbers: winningNumbers,
        total_subscribers_eligible: eligibleEntries ? eligibleEntries.length : 0,
        prize_pool_total: pools.prizePoolTotal,
        rollover_from_previous: pools.previousRollover,
        rollover_to_next: nextRollover,
        pool_5_match: pools.pool5Match,
        pool_4_match: pools.pool4Match,
        pool_3_match: pools.pool3Match,
        charity_distribution_total: pools.charityDistributionTotal,
        published_at: publishedAt,
        created_at: new Date().toISOString()
      };
      mockDataStore.draws.push(newDraw);
      drawIndex = mockDataStore.draws.length - 1;
    } else {
      mockDataStore.draws[drawIndex] = {
        ...mockDataStore.draws[drawIndex],
        mode,
        status: 'published',
        winning_numbers: winningNumbers,
        total_subscribers_eligible: eligibleEntries ? eligibleEntries.length : 0,
        prize_pool_total: pools.prizePoolTotal,
        rollover_from_previous: pools.previousRollover,
        rollover_to_next: nextRollover,
        pool_5_match: pools.pool5Match,
        pool_4_match: pools.pool4Match,
        pool_3_match: pools.pool3Match,
        charity_distribution_total: pools.charityDistributionTotal,
        published_at: publishedAt
      };
    }

    // Insert draw entries snapshot
    if (eligibleEntries && eligibleEntries.length > 0) {
      eligibleEntries.forEach(e => {
        mockDataStore.draw_entries.push({
          id: `entry-${drawId}-${e.userId}`,
          draw_id: drawId,
          user_id: e.userId,
          entry_numbers: [...e.entryNumbers], // Immutable copy
          matched_count: e.matchedCount || 0,
          matched_numbers: e.matchedNumbers || [],
          tier_won: e.tierWon || 'none',
          prize_amount: e.prizeAmount || 0,
          is_snapshot_immutable: true,
          created_at: publishedAt
        });
      });
    }

    // Insert winners
    if (winners && winners.length > 0) {
      winners.forEach(w => {
        mockDataStore.winners.push({
          id: `win-${drawId}-${w.userId}`,
          draw_id: drawId,
          draw_entry_id: `entry-${drawId}-${w.userId}`,
          user_id: w.userId,
          tier: w.tierWon,
          match_count: w.matchedCount,
          prize_amount: w.prizeAmount,
          proof_image_url: null,
          proof_submitted_at: null,
          proof_status: 'pending_upload',
          admin_notes: null,
          verified_by_user_id: null,
          verified_at: null,
          payout_status: 'pending',
          payout_reference: null,
          paid_at: null,
          created_at: publishedAt
        });
      });
    }

    return mockDataStore.draws[drawIndex];
  }
}
