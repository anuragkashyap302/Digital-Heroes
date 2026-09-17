import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';
import { ScoreService } from '../../services/scoreService.js';

export class AdminUserController {
  static async getAllUsers(req, res, next) {
    try {
      const { search, role, status } = req.query;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        let query = supabase.from('profiles').select('*, subscriptions(*), charities(name)');
        if (role) query = query.eq('role', role);
        if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

        const { data, error } = await query;
        if (error) throw error;
        return res.json({ success: true, count: data.length, users: data });
      }

      let users = mockDataStore.profiles.map(p => {
        const sub = mockDataStore.subscriptions.find(s => s.user_id === p.id && s.is_current) || null;
        const charity = mockDataStore.charities.find(c => c.id === p.selected_charity_id) || null;
        const userScores = mockDataStore.scores.filter(s => s.user_id === p.id);
        return {
          ...p,
          subscription: sub,
          charity,
          scoresCount: userScores.length,
          scores: userScores
        };
      });

      if (role) users = users.filter(u => u.role === role);
      if (status && status !== 'all') {
        users = users.filter(u => u.subscription?.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(u => u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }

      return res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { role, handicap, full_name, charity_contribution_percent } = req.body;

      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...(role && { role }),
            ...(handicap !== undefined && { handicap: parseFloat(handicap) }),
            ...(full_name && { full_name }),
            ...(charity_contribution_percent && { charity_contribution_percent: parseFloat(charity_contribution_percent) }),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.json({ success: true, message: 'User profile updated.', user: data });
      }

      const user = mockDataStore.profiles.find(p => p.id === id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (role) user.role = role;
      if (handicap !== undefined) user.handicap = parseFloat(handicap);
      if (full_name) user.full_name = full_name;
      if (charity_contribution_percent) user.charity_contribution_percent = parseFloat(charity_contribution_percent);
      user.updated_at = new Date().toISOString();

      return res.json({
        success: true,
        message: 'User profile updated by administrator.',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async overrideUserScore(req, res, next) {
    try {
      const { scoreId } = req.params;
      const { score, played_at, course_name, notes, user_id } = req.body;

      const targetUserId = user_id || req.body.userId;
      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'user_id is required for score override.' });
      }

      const updated = await ScoreService.updateScore(targetUserId, scoreId, {
        score,
        played_at,
        course_name,
        notes: notes ? `[Admin Override] ${notes}` : '[Admin Override]'
      });

      return res.json({
        success: true,
        message: 'Score successfully overridden by administrator.',
        score: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
