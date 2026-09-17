import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';
import { StorageService } from '../../services/storageService.js';

export class AdminWinnerController {
  static async getAllWinners(req, res, next) {
    try {
      const { status, tier } = req.query;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        let query = supabase.from('winners').select('*, profiles(full_name, email, handicap), draws(draw_number, name, draw_date, winning_numbers)').order('created_at', { ascending: false });

        if (status) query = query.eq('proof_status', status);
        if (tier) query = query.eq('tier', tier);

        const { data, error } = await query;
        if (error) throw error;

        // Attach signed URLs for private proofs
        const withSignedUrls = await Promise.all((data || []).map(async (w) => {
          if (w.proof_image_url) {
            const signedUrl = await StorageService.getSignedUrl(w.proof_image_url);
            return { ...w, signed_proof_url: signedUrl };
          }
          return w;
        }));

        return res.json({ success: true, count: withSignedUrls.length, winners: withSignedUrls });
      }

      let winners = mockDataStore.winners.map(w => {
        const profile = mockDataStore.profiles.find(p => p.id === w.user_id);
        const draw = mockDataStore.draws.find(d => d.id === w.draw_id);
        const userScores = mockDataStore.scores.filter(s => s.user_id === w.user_id);
        return {
          ...w,
          profiles: profile || { full_name: 'Subscriber', email: '', handicap: 18.0 },
          draws: draw || { draw_number: 101, name: 'Impact Draw', winning_numbers: [] },
          signed_proof_url: w.proof_image_url,
          userScores
        };
      });

      if (status) winners = winners.filter(w => w.proof_status === status);
      if (tier) winners = winners.filter(w => w.tier === tier);

      return res.json({
        success: true,
        count: winners.length,
        winners
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyWinner(req, res, next) {
    try {
      const { id } = req.params;
      const { proof_status, admin_notes } = req.body;
      const adminId = req.user.id;

      if (!['verified', 'rejected', 'under_review'].includes(proof_status)) {
        return res.status(400).json({ success: false, message: 'Invalid verification status.' });
      }

      const verifiedAt = new Date().toISOString();
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('winners')
          .update({
            proof_status,
            admin_notes: admin_notes || '',
            verified_by_user_id: adminId,
            verified_at: verifiedAt
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.json({ success: true, message: `Winner proof marked as ${proof_status}.`, winner: data });
      }

      const winner = mockDataStore.winners.find(w => w.id === id);
      if (!winner) {
        return res.status(404).json({ success: false, message: 'Winner record not found.' });
      }

      winner.proof_status = proof_status;
      if (admin_notes !== undefined) winner.admin_notes = admin_notes;
      winner.verified_by_user_id = adminId;
      winner.verified_at = verifiedAt;

      return res.json({
        success: true,
        message: `Winner proof successfully updated to ${proof_status}.`,
        winner
      });
    } catch (error) {
      next(error);
    }
  }

  static async markPayout(req, res, next) {
    try {
      const { id } = req.params;
      const { payout_status = 'paid', payout_reference } = req.body;

      const paidAt = payout_status === 'paid' ? new Date().toISOString() : null;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('winners')
          .update({
            payout_status,
            payout_reference: payout_reference || `DH-PAY-${Date.now()}`,
            paid_at: paidAt
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.json({ success: true, message: `Payout status updated to ${payout_status}.`, winner: data });
      }

      const winner = mockDataStore.winners.find(w => w.id === id);
      if (!winner) {
        return res.status(404).json({ success: false, message: 'Winner record not found.' });
      }

      winner.payout_status = payout_status;
      winner.payout_reference = payout_reference || `DH-PAY-${Date.now()}`;
      winner.paid_at = paidAt;

      return res.json({
        success: true,
        message: `Payout marked as ${payout_status} with reference ${winner.payout_reference}.`,
        winner
      });
    } catch (error) {
      next(error);
    }
  }
}
