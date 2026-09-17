import { DrawEngine } from '../../services/draw/DrawEngine.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';

export class AdminDrawController {
  static async getAllDraws(req, res, next) {
    try {
      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase.from('draws').select('*').order('draw_number', { ascending: false });
        if (error) throw error;
        return res.json({ success: true, count: data.length, draws: data });
      }

      return res.json({
        success: true,
        count: mockDataStore.draws.length,
        draws: [...mockDataStore.draws].sort((a, b) => b.draw_number - a.draw_number)
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDraftDraw(req, res, next) {
    try {
      const { name, draw_date, mode = 'random_lottery', prize_pool_total = 15000.00 } = req.body;
      const supabase = getSupabaseClient();
      const drawNumber = (mockDataStore.draws.length > 0 ? Math.max(...mockDataStore.draws.map(d => d.draw_number)) : 100) + 1;

      const newDrawData = {
        id: `draw-${Date.now()}`,
        draw_number: drawNumber,
        name: name || `Digital Heroes Draw #${drawNumber}`,
        draw_date: draw_date || new Date(Date.now() + 30 * 86400000).toISOString(),
        mode,
        status: 'draft',
        prize_pool_total: parseFloat(prize_pool_total) || 15000.00,
        pool_5_match: (parseFloat(prize_pool_total) || 15000.00) * 0.40,
        pool_4_match: (parseFloat(prize_pool_total) || 15000.00) * 0.35,
        pool_3_match: (parseFloat(prize_pool_total) || 15000.00) * 0.25,
        charity_distribution_total: (parseFloat(prize_pool_total) || 15000.00) * 0.20,
        created_at: new Date().toISOString()
      };

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase.from('draws').insert(newDrawData).select().single();
        if (error) throw error;
        return res.status(201).json({ success: true, message: 'Draft draw created.', draw: data });
      }

      mockDataStore.draws.push(newDrawData);
      return res.status(201).json({ success: true, message: 'Draft draw created successfully.', draw: newDrawData });
    } catch (error) {
      next(error);
    }
  }

  static async simulateDraw(req, res, next) {
    try {
      const { id } = req.params;
      const { mode, customPrizePool } = req.body;

      const simulationResult = await DrawEngine.simulateDraw({
        drawId: id,
        mode: mode || 'random_lottery',
        customPrizePool: customPrizePool ? parseFloat(customPrizePool) : null
      });

      return res.json({
        success: true,
        message: 'Draw simulation executed successfully without publishing.',
        simulation: simulationResult
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishDraw(req, res, next) {
    try {
      const { id } = req.params;
      const { mode, winningNumbers, pools, nextRollover, winners, eligibleEntries } = req.body;

      if (!winningNumbers || winningNumbers.length !== 5) {
        return res.status(400).json({ success: false, message: 'Winning numbers (5 unique integers) are required to publish.' });
      }

      const publishedDraw = await DrawEngine.publishDraw({
        drawId: id,
        mode: mode || 'random_lottery',
        winningNumbers,
        pools: pools || {
          prizePoolTotal: 15000,
          previousRollover: 0,
          pool5Match: 6000,
          pool4Match: 5250,
          pool3Match: 3750,
          charityDistributionTotal: 3000
        },
        nextRollover: nextRollover || 0,
        winners: winners || [],
        eligibleEntries: eligibleEntries || []
      });

      return res.json({
        success: true,
        message: 'Draw published successfully! Winners records and immutable snapshots created.',
        draw: publishedDraw
      });
    } catch (error) {
      next(error);
    }
  }
}
