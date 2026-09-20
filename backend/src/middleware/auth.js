import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token is required.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. Check if Supabase client is connected and try validating Supabase JWT
    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase()) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          // Query user profile from public.profiles
          let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!profile) {
            const { data: autoProf } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Subscriber Hero',
                role: 'subscriber',
                handicap: 18.0,
                charity_contribution_percent: 10.0
              }, { onConflict: 'id' })
              .select()
              .maybeSingle();
            profile = autoProf;
          }

          req.user = {
            id: user.id,
            email: user.email,
            role: profile ? profile.role : 'subscriber',
            full_name: profile ? profile.full_name : user.user_metadata?.full_name || 'Subscriber Hero',
            handicap: profile ? profile.handicap : 18.0,
            selected_charity_id: profile ? profile.selected_charity_id : null,
            charity_contribution_percent: profile ? profile.charity_contribution_percent : 10.0
          };
          return next();
        }
      } catch (sbErr) {
        // Fallback to local JWT verification
      }
    }

    // 2. Local JWT / Mock verification
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      
      // Look up user profile from mock store if in mock mode
      let userProfile = mockDataStore.profiles.find(p => p.id === decoded.id || p.email === decoded.email);
      if (!userProfile) {
        userProfile = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'subscriber',
          full_name: decoded.full_name || 'Valued Hero',
          handicap: decoded.handicap || 18.0,
          selected_charity_id: decoded.selected_charity_id || null,
          charity_contribution_percent: decoded.charity_contribution_percent || 10.0
        };
      }

      req.user = userProfile;
      return next();
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Authentication token is invalid or has expired.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'AuthError',
      message: 'Authentication service encountered an unexpected error.'
    });
  }
};
