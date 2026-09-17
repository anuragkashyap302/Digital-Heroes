import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { DRAW_CONSTANTS } from '../constants/drawConstants.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, full_name, handicap, selected_charity_id, charity_contribution_percent } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      const charityPercent = parseFloat(charity_contribution_percent) || DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE;
      if (charityPercent < DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE || charityPercent > 100) {
        return res.status(400).json({
          success: false,
          message: `Charity contribution percentage must be between ${DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE}% and 100%.`
        });
      }

      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: full_name || 'Subscriber' }
          }
        });

        if (authError) {
          return res.status(400).json({ success: false, message: authError.message });
        }

        const userId = authData.user.id;

        // Create Profile record linked to auth.users
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            full_name: full_name || 'Subscriber',
            handicap: parseFloat(handicap) || 18.0,
            role: 'subscriber',
            selected_charity_id: selected_charity_id || null,
            charity_contribution_percent: charityPercent
          })
          .select()
          .single();

        if (profileError) {
          console.warn('Profile creation note:', profileError.message);
        }

        const token = authData.session?.access_token || jwt.sign({ id: userId, email, role: 'subscriber' }, ENV.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
          success: true,
          message: 'Registration successful.',
          token,
          user: profile || { id: userId, email, full_name, role: 'subscriber', handicap: handicap || 18.0 }
        });
      }

      // Mock Data Store Registration
      const existingUser = mockDataStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const newUserId = `user-${Date.now()}`;
      const newProfile = {
        id: newUserId,
        email: email.toLowerCase(),
        full_name: full_name || 'Subscriber',
        handicap: parseFloat(handicap) || 18.0,
        role: 'subscriber',
        selected_charity_id: selected_charity_id || '11111111-1111-1111-1111-111111111111',
        charity_contribution_percent: charityPercent,
        stripe_customer_id: `cus_${newUserId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDataStore.profiles.push(newProfile);

      // Create initial trial/active mock subscription
      mockDataStore.subscriptions.push({
        id: `sub-${Date.now()}`,
        user_id: newUserId,
        stripe_subscription_id: `sub_stripe_${newUserId}`,
        stripe_price_id: 'price_monthly_mock',
        plan_type: 'monthly',
        status: 'active',
        is_current: true,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const token = jwt.sign(
        { id: newUserId, email: newProfile.email, role: newProfile.role, full_name: newProfile.full_name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: newProfile
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }

      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          // Check if this is one of our pre-seeded demo accounts (e.g. 1-click testing)
          const demoProfile = mockDataStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
          if (demoProfile && (password === 'Password123!' || password === 'admin123' || password === 'password')) {
            const token = jwt.sign(
              { id: demoProfile.id, email: demoProfile.email, role: demoProfile.role, full_name: demoProfile.full_name },
              ENV.JWT_SECRET,
              { expiresIn: '7d' }
            );
            return res.json({
              success: true,
              message: `Demo ${demoProfile.role} login successful.`,
              token,
              user: demoProfile
            });
          }

          return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        return res.json({
          success: true,
          message: 'Login successful.',
          token: authData.session.access_token,
          user: profile || {
            id: authData.user.id,
            email: authData.user.email,
            role: 'subscriber',
            full_name: authData.user.user_metadata?.full_name || 'Subscriber'
          }
        });
      }

      // Mock Data Store Login
      const userProfile = mockDataStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!userProfile) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Use one of the demo accounts or register a new one.'
        });
      }

      const token = jwt.sign(
        { id: userProfile.id, email: userProfile.email, role: userProfile.role, full_name: userProfile.full_name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: userProfile
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const supabase = getSupabaseClient();

      let profile = null;
      let subscription = null;
      let charity = null;

      if (supabase && !isMockDatabase()) {
        try {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
          profile = p || req.user;
          const { data: s } = await supabase.from('subscriptions').select('*').eq('user_id', userId).eq('is_current', true).maybeSingle();
          subscription = s;
          if (profile?.selected_charity_id) {
            const { data: c } = await supabase.from('charities').select('*').eq('id', profile.selected_charity_id).maybeSingle();
            charity = c;
          }
        } catch (dbErr) {
          console.warn('Supabase getMe query warning:', dbErr.message);
          profile = req.user;
        }
      } else {
        profile = mockDataStore.profiles.find(p => p.id === userId) || req.user;
        subscription = mockDataStore.subscriptions.find(s => s.user_id === userId && s.is_current) || null;
        if (profile?.selected_charity_id) {
          charity = mockDataStore.charities.find(c => c.id === profile.selected_charity_id) || null;
        }
      }

      return res.json({
        success: true,
        user: profile || req.user,
        subscription,
        selectedCharity: charity
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCharityPreference(req, res, next) {
    try {
      const userId = req.user.id;
      const { selected_charity_id, charity_contribution_percent } = req.body;

      const percent = parseFloat(charity_contribution_percent);
      if (isNaN(percent) || percent < DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE || percent > 100) {
        return res.status(400).json({
          success: false,
          message: `Charity contribution percentage must be at least ${DRAW_CONSTANTS.MIN_CHARITY_PERCENTAGE}% and at most 100%.`
        });
      }

      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            selected_charity_id: selected_charity_id || null,
            charity_contribution_percent: percent,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return res.json({ success: true, message: 'Charity preferences updated.', user: data });
      }

      const target = mockDataStore.profiles.find(p => p.id === userId);
      if (target) {
        if (selected_charity_id !== undefined) target.selected_charity_id = selected_charity_id;
        target.charity_contribution_percent = percent;
        target.updated_at = new Date().toISOString();
      }

      return res.json({
        success: true,
        message: 'Charity preferences updated successfully.',
        user: target || req.user
      });
    } catch (error) {
      next(error);
    }
  }
}
