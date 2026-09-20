import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { DRAW_CONSTANTS } from '../constants/drawConstants.js';

export class ScoreService {
  /**
   * Retrieve all scores for a given user in reverse chronological order
   */
  static async getUserScores(userId) {
    const supabase = getSupabaseClient();
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (supabase && !isMockDatabase() && isUuid) {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(DRAW_CONSTANTS.MAX_RETAINED_SCORES || 5);

        if (!error && Array.isArray(data)) {
          return data;
        }
        if (error) {
          console.warn('Supabase getUserScores query error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getUserScores exception:', err.message);
      }
    }

    // Mock store scores for this user (for mock mode or non-UUID test users)
    return mockDataStore.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at) || new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Add a new Stableford score (1-45, 1 per date, max 5 FIFO queue)
   */
  static async addScore(userOrId, { score, played_at, course_name, notes }) {
    const userId = typeof userOrId === 'object' ? userOrId.id : userOrId;
    const userEmail = typeof userOrId === 'object' ? userOrId.email : null;
    const userName = typeof userOrId === 'object' ? userOrId.full_name : null;

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
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (supabase && !isMockDatabase() && isUuid) {
      // Step A: Ensure profile row exists in public.profiles so foreign key constraint scores_user_id_fkey is satisfied
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!profileCheck) {
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: userId,
          email: userEmail || 'subscriber@digitalheroes.io',
          full_name: userName || 'Subscriber Hero',
          role: 'subscriber',
          handicap: 18.0,
          charity_contribution_percent: 10.0
        }, { onConflict: 'id' });

        if (upsertErr) {
          console.warn('Profile upsert notice:', upsertErr.message);
        }
      }

      // Step B: Check duplicate date constraint
      const { data: existingDateScore } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', userId)
        .eq('played_at', played_at)
        .maybeSingle();

      if (existingDateScore) {
        const conflictErr = new Error(`A score for date ${played_at} already exists. You can edit the existing score instead.`);
        conflictErr.statusCode = 409;
        throw conflictErr;
      }

      // Step C: Try stored procedure add_score_fifo first
      let rpcSucceeded = false;
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('add_score_fifo', {
          p_user_id: userId,
          p_score: parsedScore,
          p_played_at: played_at,
          p_course_name: course_name || 'Home Club',
          p_notes: notes || null
        });

        if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
          rpcSucceeded = true;
          return rpcData;
        }
        if (rpcErr) {
          console.warn('Supabase add_score_fifo RPC warning:', rpcErr.message);
        }
      } catch (rpcErr) {
        console.warn('RPC invocation error, using direct table operations:', rpcErr.message);
      }

      if (!rpcSucceeded) {
        // Direct table insert
        const { data: insertedRow, error: insertErr } = await supabase
          .from('scores')
          .insert({
            user_id: userId,
            score: parsedScore,
            played_at,
            course_name: course_name || 'Home Club',
            notes: notes || null
          })
          .select()
          .single();

        if (insertErr) {
          if (insertErr.code === '23505') {
            const conflictErr = new Error(`A score for date ${played_at} already exists. You can edit the existing score instead.`);
            conflictErr.statusCode = 409;
            throw conflictErr;
          }
          console.error('Supabase direct score insert error:', insertErr.message);
          throw new Error(`Failed to record score: ${insertErr.message}`);
        }

        // FIFO auto-eviction: Retain exactly latest 5 in Supabase
        const { data: allUserScores } = await supabase
          .from('scores')
          .select('id')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .order('created_at', { ascending: false });

        if (allUserScores && allUserScores.length > DRAW_CONSTANTS.MAX_RETAINED_SCORES) {
          const evictIds = allUserScores.slice(DRAW_CONSTANTS.MAX_RETAINED_SCORES).map(s => s.id);
          await supabase.from('scores').delete().in('id', evictIds);
        }

        // Fetch refreshed 5 scores from Supabase
        const { data: finalScores } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(DRAW_CONSTANTS.MAX_RETAINED_SCORES || 5);

        return finalScores || [insertedRow];
      }
    }

    // In-Memory Transaction Simulation (for mock mode or non-UUID users)
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
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (supabase && !isMockDatabase() && isUuid) {
      if (played_at) {
        const { data: dupDate } = await supabase
          .from('scores')
          .select('id')
          .eq('user_id', userId)
          .eq('played_at', played_at)
          .neq('id', scoreId)
          .maybeSingle();

        if (dupDate) {
          const err = new Error(`Another score on date ${played_at} already exists.`);
          err.statusCode = 409;
          throw err;
        }
      }

      const updatePayload = {
        score: parsedScore,
        course_name: course_name || 'Home Club',
        notes: notes !== undefined ? notes : null
      };
      if (played_at) updatePayload.played_at = played_at;

      const { data, error } = await supabase
        .from('scores')
        .update(updatePayload)
        .eq('id', scoreId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const conflictErr = new Error(`Another score on date ${played_at} already exists.`);
          conflictErr.statusCode = 409;
          throw conflictErr;
        }
        throw new Error(error.message);
      }
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
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (supabase && !isMockDatabase() && isUuid) {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
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
