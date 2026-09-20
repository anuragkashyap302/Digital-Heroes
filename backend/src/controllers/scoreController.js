import { ScoreService } from '../services/scoreService.js';

export class ScoreController {
  static async getScores(req, res, next) {
    try {
      const userId = req.user.id;
      const scores = await ScoreService.getUserScores(userId);
      return res.json({
        success: true,
        count: scores.length,
        scores
      });
    } catch (error) {
      next(error);
    }
  }

  static async addScore(req, res, next) {
    try {
      const user = req.user;
      const { score, played_at, course_name, notes } = req.body;

      const updatedScores = await ScoreService.addScore(user, {
        score,
        played_at,
        course_name,
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Stableford score recorded successfully.',
        scores: updatedScores
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateScore(req, res, next) {
    try {
      const userId = req.user.id;
      const scoreId = req.params.id;
      const { score, played_at, course_name, notes } = req.body;

      const updatedScore = await ScoreService.updateScore(userId, scoreId, {
        score,
        played_at,
        course_name,
        notes
      });

      return res.json({
        success: true,
        message: 'Score updated successfully.',
        score: updatedScore
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteScore(req, res, next) {
    try {
      const userId = req.user.id;
      const scoreId = req.params.id;

      await ScoreService.deleteScore(userId, scoreId);

      return res.json({
        success: true,
        message: 'Score deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}
