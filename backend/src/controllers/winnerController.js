import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { StorageService } from '../services/storageService.js';

export class WinnerController {
  static async getMyWinnings(req, res, next) {
    try {
      const userId = req.user.id;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('winners')
          .select('*, draws(draw_number, name, draw_date, winning_numbers)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Generate signed URLs for private proofs
        const winningsWithSignedUrls = await Promise.all((data || []).map(async (w) => {
          if (w.proof_image_url) {
            const signedUrl = await StorageService.getSignedUrl(w.proof_image_url);
            return { ...w, signed_proof_url: signedUrl };
          }
          return w;
        }));

        return res.json({ success: true, count: winningsWithSignedUrls.length, winnings: winningsWithSignedUrls });
      }

      const winnings = mockDataStore.winners
        .filter(w => w.user_id === userId)
        .map(w => {
          const draw = mockDataStore.draws.find(d => d.id === w.draw_id);
          return { ...w, draws: draw, signed_proof_url: w.proof_image_url };
        });

      return res.json({
        success: true,
        count: winnings.length,
        winnings
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProof(req, res, next) {
    try {
      const userId = req.user.id;
      const winnerId = req.params.id;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a scorecard image or document.' });
      }

      const uploadResult = await StorageService.uploadProof({
        winnerId,
        userId,
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype
      });

      const submittedAt = new Date().toISOString();
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('winners')
          .update({
            proof_image_url: uploadResult.path,
            proof_submitted_at: submittedAt,
            proof_status: 'under_review'
          })
          .eq('id', winnerId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return res.json({
          success: true,
          message: 'Scorecard proof uploaded successfully and is now under administrator review.',
          winner: data
        });
      }

      const winner = mockDataStore.winners.find(w => w.id === winnerId && w.user_id === userId);
      if (!winner) {
        return res.status(404).json({ success: false, message: 'Winning record not found or not owned by user.' });
      }

      winner.proof_image_url = uploadResult.path;
      winner.proof_submitted_at = submittedAt;
      winner.proof_status = 'under_review';

      return res.json({
        success: true,
        message: 'Scorecard proof uploaded successfully and is now under administrator review.',
        winner,
        simulated: true
      });
    } catch (error) {
      next(error);
    }
  }
}
