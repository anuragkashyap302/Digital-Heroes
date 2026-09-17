import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { DRAW_CONSTANTS } from '../constants/drawConstants.js';

export class ScoreService {
  /**
   * Retrieve all scores for a given user in reverse chronological order
   */
  static async getUserScores(userId) {
    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    // Mock Data Store
    return mockDataStore.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at) || new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Add a new Stableford score (1-45, 1 per date, max 5 FIFO queue)
   */
  static async addScore(userId, { score, played_at, course_name, notes }) {
    // 1. Validation: Score must be an integer between 1 and 45
    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < DRAW_CONSTANTS.MIN_SCORE || parsedScore > DRAW_CONSTANTS.MAX_SCORE) {
      const err = new Error(`Stableford score must be a valid integer between ${DRAW_CONSTANTS.MIN_SCORE} and ${DRAW_CONSTANTS.MAX_SCORE}.`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Validation: Date must be provided
    if (!played_at) {
      const err = new Error('Score date (played_at) is required.');
      err.statusCode = 400;
      throw err;
    }

    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      try {
        // Use database function add_score_fifo for atomic transaction and FIFO eviction
        const { data, error } = await supabase.rpc('add_score_fifo', {
          p_user_id: userId,
          p_score: parsedScore,
          p_played_at: played_at,
          p_course_name: course_name || 'Home Club',
          p_notes: notes || null
        });

        if (error) {
          if (error.code === '23505') {
            const conflictErr = new Error(`A score for date ${played_at} already exists. You can edit the existing score instead.`);
            conflictErr.statusCode = 409;
            throw conflictErr;
          }
          if (error.code === 'PGRST202' || error.code === '42P01' || error.code === '22P02' || error.message?.includes('schema cache')) {
            console.warn('⚠️ Supabase RPC add_score_fifo not found. Falling back to local store. (Run migrations/002_rls_and_functions.sql in Supabase SQL editor to enable DB function).');
          } else {
            throw error;
          }
        } else {
          return data;
        }
      } catch (rpcErr) {
        if (rpcErr.statusCode === 409) throw rpcErr;
        console.warn('Supabase RPC call error, falling back:', rpcErr.message);
      }
    }

    // In-Memory Transaction Simulation
    // Check duplicate date for this user
    const existingDate = mockDataStore.scores.find(s => s.user_id === userId && s.played_at === played_at);
    if (existingDate) {
      const conflictErr = new Error(`A score for date ${played_at} already exists. You can edit the existing score instead.`);
      conflictErr.statusCode = 409;
      throw conflictErr;
    }

    const newScore = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      score: parsedScore,
      played_at,
      course_name: course_name || 'Home Club',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    mockDataStore.scores.push(newScore);

    // Sort all scores for this user reverse-chronologically
    const userScores = mockDataStore.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at) || new Date(b.created_at) - new Date(a.created_at));

    // If more than 5 scores exist, evict the oldest beyond index 4
    if (userScores.length > DRAW_CONSTANTS.MAX_RETAINED_SCORES) {
      const scoresToKeep = userScores.slice(0, DRAW_CONSTANTS.MAX_RETAINED_SCORES);
      const keepIds = new Set(scoresToKeep.map(s => s.id));
      
      // Remove evicted scores from data store
      mockDataStore.scores = mockDataStore.scores.filter(s => s.user_id !== userId || keepIds.has(s.id));
    }

    return mockDataStore.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at) || new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Edit an existing score by ID
   */
  static async updateScore(userId, scoreId, { score, played_at, course_name, notes }) {
    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < DRAW_CONSTANTS.MIN_SCORE || parsedScore > DRAW_CONSTANTS.MAX_SCORE) {
      const err = new Error(`Stableford score must be between ${DRAW_CONSTANTS.MIN_SCORE} and ${DRAW_CONSTANTS.MAX_SCORE}.`);
      err.statusCode = 400;
      throw err;
    }

    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      const { data, error } = await supabase
        .from('scores')
        .update({
          score: parsedScore,
          played_at: played_at,
          course_name: course_name,
          notes: notes
        })
        .eq('id', scoreId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const targetIndex = mockDataStore.scores.findIndex(s => s.id === scoreId && s.user_id === userId);
    if (targetIndex === -1) {
      const err = new Error('Score record not found or not owned by user.');
      err.statusCode = 404;
      throw err;
    }

    if (played_at) {
      const duplicateDate = mockDataStore.scores.find(
        s => s.user_id === userId && s.played_at === played_at && s.id !== scoreId
      );
      if (duplicateDate) {
        const err = new Error(`Another score on date ${played_at} already exists.`);
        err.statusCode = 409;
        throw err;
      }
      mockDataStore.scores[targetIndex].played_at = played_at;
    }

    mockDataStore.scores[targetIndex].score = parsedScore;
    if (course_name !== undefined) mockDataStore.scores[targetIndex].course_name = course_name;
    if (notes !== undefined) mockDataStore.scores[targetIndex].notes = notes;

    return mockDataStore.scores[targetIndex];
  }

  /**
   * Delete a score by ID
   */
  static async deleteScore(userId, scoreId) {
    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    }

    const initialLength = mockDataStore.scores.length;
    mockDataStore.scores = mockDataStore.scores.filter(s => !(s.id === scoreId && s.user_id === userId));
    if (mockDataStore.scores.length === initialLength) {
      const err = new Error('Score record not found or not owned by user.');
      err.statusCode = 404;
      throw err;
    }
    return { success: true };
  }
}
