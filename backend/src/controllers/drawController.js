import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { ScoreService } from '../services/scoreService.js';

export class DrawController {
  static async getCurrentDraw(req, res, next) {
    try {
      const supabase = getSupabaseClient();
      let draftDraw = null;
      let userScores = [];

      if (supabase && !isMockDatabase()) {
        const { data: draws } = await supabase
          .from('draws')
          .select('*')
          .in('status', ['draft', 'simulated'])
          .order('draw_date', { ascending: true })
          .limit(1);

        draftDraw = draws?.[0] || null;

        if (req.user?.id) {
          userScores = await ScoreService.getUserScores(req.user.id);
        }
      } else {
        draftDraw = mockDataStore.draws.find(d => d.status === 'draft' || d.status === 'simulated') || {
          id: 'draw-upcoming',
          draw_number: 104,
          name: 'Digital Heroes Autumn Impact Draw',
          draw_date: new Date(Date.now() + 14 * 86400000).toISOString(),
          mode: 'random_lottery',
          status: 'draft',
          prize_pool_total: 18500.00,
          pool_5_match: 7400.00,
          pool_4_match: 6475.00,
          pool_3_match: 4625.00
        };

        if (req.user?.id) {
          userScores = await ScoreService.getUserScores(req.user.id);
        }
      }

      // Check if user has all 5 scores entered
      const isEligible = userScores.length === 5;

      return res.json({
        success: true,
        currentDraw: draftDraw,
        userEligibility: {
          hasFiveScores: isEligible,
          enteredScoresCount: userScores.length,
          currentNumbers: userScores.map(s => s.score)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDrawArchive(req, res, next) {
    try {
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('draws')
          .select('*')
          .eq('status', 'published')
          .order('draw_number', { ascending: false });

        if (error) throw error;
        return res.json({ success: true, count: data.length, draws: data });
      }

      const published = mockDataStore.draws
        .filter(d => d.status === 'published')
        .sort((a, b) => b.draw_number - a.draw_number);

      return res.json({
        success: true,
        count: published.length,
        draws: published
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDrawById(req, res, next) {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data: draw, error } = await supabase.from('draws').select('*').eq('id', id).single();
        if (error || !draw) {
          return res.status(404).json({ success: false, message: 'Draw not found.' });
        }

        const { data: winners } = await supabase.from('winners').select('*, profiles(full_name)').eq('draw_id', id);

        return res.json({
          success: true,
          draw,
          winners: winners || []
        });
      }

      const draw = mockDataStore.draws.find(d => d.id === id || String(d.draw_number) === id);
      if (!draw) {
        return res.status(404).json({ success: false, message: 'Draw not found.' });
      }

      const winners = mockDataStore.winners.filter(w => w.draw_id === draw.id).map(w => {
        const prof = mockDataStore.profiles.find(p => p.id === w.user_id);
        return { ...w, full_name: prof?.full_name || 'Subscriber' };
      });

      return res.json({
        success: true,
        draw,
        winners
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyEntries(req, res, next) {
    try {
      const userId = req.user.id;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('draw_entries')
          .select('*, draws(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json({ success: true, count: data.length, entries: data });
      }

      const entries = mockDataStore.draw_entries
        .filter(e => e.user_id === userId)
        .map(e => {
          const draw = mockDataStore.draws.find(d => d.id === e.draw_id);
          return { ...e, draw };
        });

      return res.json({
        success: true,
        count: entries.length,
        entries
      });
    } catch (error) {
      next(error);
    }
  }
}
