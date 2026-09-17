import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';

export class AdminReportController {
  static async getAnalyticsSummary(req, res, next) {
    try {
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        // Query counts & totals using Supabase aggregations
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: activeSubs } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
        const { data: draws } = await supabase.from('draws').select('prize_pool_total, charity_distribution_total, status').eq('status', 'published');
        const { data: donations } = await supabase.from('donations').select('amount');

        const totalPrizePoolAwarded = (draws || []).reduce((sum, d) => sum + parseFloat(d.prize_pool_total || 0), 0);
        const totalCharityFromDraws = (draws || []).reduce((sum, d) => sum + parseFloat(d.charity_distribution_total || 0), 0);
        const totalDirectDonations = (donations || []).reduce((sum, don) => sum + parseFloat(don.amount || 0), 0);

        return res.json({
          success: true,
          metrics: {
            totalUsers: totalUsers || 0,
            activeSubscribers: activeSubs || 0,
            totalPrizePoolAwarded,
            totalCharityRaised: totalCharityFromDraws + totalDirectDonations,
            totalDirectDonations,
            publishedDrawsCount: (draws || []).length
          }
        });
      }

      // Mock Analytics Aggregations
      const totalUsers = mockDataStore.profiles.length;
      const activeSubscribers = mockDataStore.subscriptions.filter(s => s.status === 'active').length;
      const publishedDraws = mockDataStore.draws.filter(d => d.status === 'published');
      const totalPrizePoolAwarded = publishedDraws.reduce((sum, d) => sum + (parseFloat(d.prize_pool_total) || 0), 0);
      const totalCharityFromDraws = publishedDraws.reduce((sum, d) => sum + (parseFloat(d.charity_distribution_total) || 0), 0);
      const totalDirectDonations = mockDataStore.donations.reduce((sum, don) => sum + (parseFloat(don.amount) || 0), 0);
      const totalCharityRaised = totalCharityFromDraws + totalDirectDonations;

      // Monthly Draw Performance Breakdown
      const drawPerformance = publishedDraws.map(d => ({
        drawNumber: d.draw_number,
        name: d.name,
        date: d.draw_date,
        mode: d.mode,
        eligibleSubscribers: d.total_subscribers_eligible,
        prizePool: d.prize_pool_total,
        charityDistributed: d.charity_distribution_total,
        rolloverToNext: d.rollover_to_next
      }));

      // Charity Breakdown
      const charityBreakdown = mockDataStore.charities.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        totalRaised: c.total_raised,
        isFeatured: c.is_featured
      }));

      return res.json({
        success: true,
        metrics: {
          totalUsers,
          activeSubscribers,
          totalPrizePoolAwarded,
          totalCharityRaised,
          totalDirectDonations,
          publishedDrawsCount: publishedDraws.length,
          avgCharityContributionPercent: 16.5,
          drawParticipationRate: '94.2%'
        },
        drawPerformance,
        charityBreakdown
      });
    } catch (error) {
      next(error);
    }
  }
}
