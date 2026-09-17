import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabase = null;
let isMockDb = false;

// In-Memory Data Store for local zero-config demonstration and testing when Supabase keys are not set
export const mockDataStore = {
  charities: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Fairway Foundation for Youth',
      slug: 'fairway-foundation-for-youth',
      category: 'Youth & Education',
      tagline: 'Empowering underprivileged youth through mentorship, golf accessibility, and academic scholarships.',
      description: 'The Fairway Foundation breaks socioeconomic barriers by introducing young people from diverse urban communities to the discipline, life skills, and career networks fostered through the game of golf. Every contribution funds equipment, PGA junior coaching, and university STEM scholarships.',
      logo_url: 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      website_url: 'https://fairwayyouth.org',
      total_raised: 18450.00,
      is_featured: true,
      upcoming_events: [
        { id: 'ev-1', title: 'Junior Summer Championship & Gala', date: '2026-10-15', location: 'Wentworth Club, Surrey', description: 'Annual charity scramble pairing junior proteges with tour professionals.' },
        { id: 'ev-2', title: 'STEM in Sport Youth Workshop', date: '2026-11-08', location: 'Birmingham National Arena', description: 'Interactive workshop exploring biomechanics, data analytics, and sports science.' }
      ],
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Green Greens Conservation Trust',
      slug: 'green-greens-conservation-trust',
      category: 'Environmental Protection',
      tagline: 'Restoring natural biodiversity and pollinator corridors across protected open landscapes.',
      description: 'Green Greens Conservation Trust partners with golf courses, wetlands, and nature reserves to eliminate harmful runoff, restore native flora, build solar-powered water capture, and safeguard endangered pollinator populations across over 40,000 hectares of green spaces.',
      logo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
      website_url: 'https://greengreens.org',
      total_raised: 12900.00,
      is_featured: true,
      upcoming_events: [
        { id: 'ev-3', title: 'Rewilding the Links Symposium', date: '2026-10-22', location: 'St Andrews Ecology Center', description: 'Global summit on sustainable turf management and coastal dune preservation.' }
      ],
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Veterans On Course Project',
      slug: 'veterans-on-course-project',
      category: 'Veterans & Mental Health',
      tagline: 'Rehabilitation, mental wellness, and community reintegration for wounded service personnel.',
      description: 'Veterans On Course harnesses the therapeutic calm of outdoor sports and peer camaraderie to support military veterans overcoming PTSD, physical injury, and social isolation. We provide adaptive equipment, clinical support sessions, and vocational pathways.',
      logo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80',
      website_url: 'https://veteranscourse.org',
      total_raised: 21350.00,
      is_featured: false,
      upcoming_events: [
        { id: 'ev-4', title: 'Heroes Invitational Scramble', date: '2026-11-14', location: 'Celtic Manor Resort, Wales', description: '36-hole charity team event honoring veterans and raising mental health support funds.' }
      ],
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Cure Heart Global Initiative',
      slug: 'cure-heart-global-initiative',
      category: 'Medical & Health Research',
      tagline: 'Accelerating groundbreaking cardiovascular research and community heart health screenings.',
      description: 'Cure Heart Global Initiative funds early-detection heart disease screening vans and cutting-edge clinical trials to prevent sudden cardiac arrest in active athletes and community members of all ages.',
      logo_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      website_url: 'https://cureheartglobal.org',
      total_raised: 9750.00,
      is_featured: false,
      upcoming_events: [],
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  profiles: [
    {
      id: 'user-admin-01',
      email: 'admin@digitalheroes.io',
      full_name: 'Victoria Vance (Chief Administrator)',
      handicap: 4.2,
      role: 'admin',
      selected_charity_id: '11111111-1111-1111-1111-111111111111',
      charity_contribution_percent: 25.0,
      stripe_customer_id: 'cus_admin_mock_1',
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-sub-01',
      email: 'alexander@meridian.com',
      full_name: 'Alexander Cross',
      handicap: 14.6,
      role: 'subscriber',
      selected_charity_id: '11111111-1111-1111-1111-111111111111',
      charity_contribution_percent: 15.0,
      stripe_customer_id: 'cus_sub_mock_1',
      created_at: new Date('2026-01-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-sub-02',
      email: 'elena.rostova@vanguard.io',
      full_name: 'Elena Rostova',
      handicap: 9.8,
      role: 'subscriber',
      selected_charity_id: '22222222-2222-2222-2222-222222222222',
      charity_contribution_percent: 20.0,
      stripe_customer_id: 'cus_sub_mock_2',
      created_at: new Date('2026-02-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-sub-03',
      email: 'marcus.sterling@apex.co.uk',
      full_name: 'Marcus Sterling',
      handicap: 22.0,
      role: 'subscriber',
      selected_charity_id: '33333333-3333-3333-3333-333333333333',
      charity_contribution_percent: 10.0,
      stripe_customer_id: 'cus_sub_mock_3',
      created_at: new Date('2026-02-15').toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  subscriptions: [
    {
      id: 'sub-01',
      user_id: 'user-sub-01',
      stripe_subscription_id: 'sub_stripe_001',
      stripe_price_id: 'price_monthly_mock',
      plan_type: 'monthly',
      status: 'active',
      is_current: true,
      current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
      current_period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
      created_at: new Date('2026-01-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub-02',
      user_id: 'user-sub-02',
      stripe_subscription_id: 'sub_stripe_002',
      stripe_price_id: 'price_yearly_discounted_mock',
      plan_type: 'yearly_discounted',
      status: 'active',
      is_current: true,
      current_period_start: new Date('2026-02-01').toISOString(),
      current_period_end: new Date('2027-02-01').toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
      created_at: new Date('2026-02-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub-03',
      user_id: 'user-sub-03',
      stripe_subscription_id: 'sub_stripe_003',
      stripe_price_id: 'price_monthly_mock',
      plan_type: 'monthly',
      status: 'active',
      is_current: true,
      current_period_start: new Date('2026-02-15').toISOString(),
      current_period_end: new Date(Date.now() + 10 * 86400000).toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
      created_at: new Date('2026-02-15').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub-admin',
      user_id: 'user-admin-01',
      stripe_subscription_id: 'sub_stripe_admin',
      stripe_price_id: 'price_yearly_mock',
      plan_type: 'yearly',
      status: 'active',
      is_current: true,
      current_period_start: new Date('2026-01-01').toISOString(),
      current_period_end: new Date('2027-01-01').toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  scores: [
    // Alexander Cross (user-sub-01) 5 scores (strictly ordered, 1-45, 1 per date)
    { id: 'sc-101', user_id: 'user-sub-01', score: 38, played_at: '2026-09-10', course_name: 'Sun City Championship Course', notes: 'Great back 9, 3 birdies', created_at: new Date('2026-09-10T14:30:00').toISOString() },
    { id: 'sc-102', user_id: 'user-sub-01', score: 35, played_at: '2026-09-03', course_name: 'Royal Oak Dunes', notes: 'Windy conditions', created_at: new Date('2026-09-03T11:00:00').toISOString() },
    { id: 'sc-103', user_id: 'user-sub-01', score: 41, played_at: '2026-08-28', course_name: 'Silverstone Pines', notes: 'Personal best this season', created_at: new Date('2026-08-28T16:00:00').toISOString() },
    { id: 'sc-104', user_id: 'user-sub-01', score: 32, played_at: '2026-08-20', course_name: 'St Andrews Bay', notes: 'Tough bunkers', created_at: new Date('2026-08-20T10:15:00').toISOString() },
    { id: 'sc-105', user_id: 'user-sub-01', score: 36, played_at: '2026-08-12', course_name: 'Wentworth West', notes: 'Consistent putting', created_at: new Date('2026-08-12T15:45:00').toISOString() },

    // Elena Rostova (user-sub-02) 5 scores
    { id: 'sc-201', user_id: 'user-sub-02', score: 39, played_at: '2026-09-12', course_name: 'Loch Lomond Links', notes: 'Clean iron play', created_at: new Date('2026-09-12T13:00:00').toISOString() },
    { id: 'sc-202', user_id: 'user-sub-02', score: 37, played_at: '2026-09-05', course_name: 'Loch Lomond Links', notes: 'Steady pars', created_at: new Date('2026-09-05T12:00:00').toISOString() },
    { id: 'sc-203', user_id: 'user-sub-02', score: 42, played_at: '2026-08-29', course_name: 'Gleneagles King Course', notes: 'Eagle on the 14th', created_at: new Date('2026-08-29T15:00:00').toISOString() },
    { id: 'sc-204', user_id: 'user-sub-02', score: 34, played_at: '2026-08-21', course_name: 'Carnoustie Championship', notes: 'Strong gale winds', created_at: new Date('2026-08-21T09:30:00').toISOString() },
    { id: 'sc-205', user_id: 'user-sub-02', score: 40, played_at: '2026-08-14', course_name: 'Trump Turnberry', notes: 'Smooth rhythm', created_at: new Date('2026-08-14T14:10:00').toISOString() },

    // Marcus Sterling (user-sub-03) 5 scores
    { id: 'sc-301', user_id: 'user-sub-03', score: 28, played_at: '2026-09-08', course_name: 'Moor Park High Course', notes: 'Struggled off tee', created_at: new Date('2026-09-08T11:00:00').toISOString() },
    { id: 'sc-302', user_id: 'user-sub-03', score: 31, played_at: '2026-09-01', course_name: 'The Grove', notes: 'Solid approach shots', created_at: new Date('2026-09-01T10:30:00').toISOString() },
    { id: 'sc-303', user_id: 'user-sub-03', score: 35, played_at: '2026-08-24', course_name: 'Woburn Duke Course', notes: 'Good recovery', created_at: new Date('2026-08-24T14:00:00').toISOString() },
    { id: 'sc-304', user_id: 'user-sub-03', score: 29, played_at: '2026-08-16', course_name: 'Burnham Beeches', notes: 'Rain delay', created_at: new Date('2026-08-16T12:15:00').toISOString() },
    { id: 'sc-305', user_id: 'user-sub-03', score: 33, played_at: '2026-08-09', course_name: 'Stoke Park', notes: 'Strong finish', created_at: new Date('2026-08-09T16:20:00').toISOString() }
  ],
  draws: [
    {
      id: 'draw-101',
      draw_number: 101,
      name: 'Digital Heroes July Impact Draw #101',
      draw_date: '2026-07-31T20:00:00.000Z',
      mode: 'random_lottery',
      status: 'published',
      winning_numbers: [14, 22, 28, 35, 41],
      total_subscribers_eligible: 240,
      prize_pool_total: 12000.00,
      rollover_from_previous: 0.00,
      rollover_to_next: 4800.00,
      pool_5_match: 4800.00,
      pool_4_match: 4200.00,
      pool_3_match: 3000.00,
      charity_distribution_total: 2400.00,
      simulation_meta: { execution_mode: 'random_lottery', seed_timestamp: '2026-07-31T20:00:00.000Z' },
      published_at: '2026-07-31T20:05:00.000Z',
      created_at: '2026-07-31T18:00:00.000Z'
    },
    {
      id: 'draw-102',
      draw_number: 102,
      name: 'Digital Heroes August Impact Draw #102',
      draw_date: '2026-08-31T20:00:00.000Z',
      mode: 'algorithmic_frequency',
      status: 'published',
      winning_numbers: [35, 38, 41, 32, 36], // matches Alexander Cross's scores for rich winner demo!
      total_subscribers_eligible: 285,
      prize_pool_total: 19050.00,
      rollover_from_previous: 4800.00,
      rollover_to_next: 0.00,
      pool_5_match: 10500.00,
      pool_4_match: 4987.50,
      pool_3_match: 3562.50,
      charity_distribution_total: 2850.00,
      simulation_meta: { execution_mode: 'algorithmic_frequency', variance_normalized: 0.94 },
      published_at: '2026-08-31T20:05:00.000Z',
      created_at: '2026-08-31T18:00:00.000Z'
    },
    {
      id: 'draw-103',
      draw_number: 103,
      name: 'Digital Heroes September Grand Draw #103',
      draw_date: '2026-09-30T20:00:00.000Z',
      mode: 'random_lottery',
      status: 'draft',
      winning_numbers: null,
      total_subscribers_eligible: 310,
      prize_pool_total: 16500.00,
      rollover_from_previous: 0.00,
      rollover_to_next: 0.00,
      pool_5_match: 6600.00,
      pool_4_match: 5775.00,
      pool_3_match: 4125.00,
      charity_distribution_total: 3300.00,
      simulation_meta: {},
      published_at: null,
      created_at: new Date('2026-09-01').toISOString()
    }
  ],
  draw_entries: [
    {
      id: 'entry-102-user-sub-01',
      draw_id: 'draw-102',
      user_id: 'user-sub-01',
      entry_numbers: [38, 35, 41, 32, 36],
      matched_count: 5,
      matched_numbers: [35, 38, 41, 32, 36],
      tier_won: 'tier_5',
      prize_amount: 10500.00,
      is_snapshot_immutable: true,
      created_at: '2026-08-31T19:55:00.000Z'
    },
    {
      id: 'entry-102-user-sub-02',
      draw_id: 'draw-102',
      user_id: 'user-sub-02',
      entry_numbers: [39, 37, 42, 34, 40],
      matched_count: 0,
      matched_numbers: [],
      tier_won: 'none',
      prize_amount: 0.00,
      is_snapshot_immutable: true,
      created_at: '2026-08-31T19:55:00.000Z'
    },
    {
      id: 'entry-102-user-sub-03',
      draw_id: 'draw-102',
      user_id: 'user-sub-03',
      entry_numbers: [28, 31, 35, 29, 33],
      matched_count: 3,
      matched_numbers: [35, 31, 33],
      tier_won: 'tier_3',
      prize_amount: 1781.25, // split of £3,562.50 between 2 winners
      is_snapshot_immutable: true,
      created_at: '2026-08-31T19:55:00.000Z'
    }
  ],
  winners: [
    {
      id: 'win-102-01',
      draw_id: 'draw-102',
      draw_entry_id: 'entry-102-user-sub-01',
      user_id: 'user-sub-01',
      tier: 'tier_5',
      match_count: 5,
      prize_amount: 10500.00,
      proof_image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
      proof_submitted_at: '2026-09-01T09:15:00.000Z',
      proof_status: 'under_review',
      admin_notes: 'Official tournament scorecard submitted. High clarity verification.',
      verified_by_user_id: null,
      verified_at: null,
      payout_status: 'pending',
      payout_reference: null,
      paid_at: null,
      created_at: '2026-08-31T20:05:00.000Z'
    },
    {
      id: 'win-102-02',
      draw_id: 'draw-102',
      draw_entry_id: 'entry-102-user-sub-03',
      user_id: 'user-sub-03',
      tier: 'tier_3',
      match_count: 3,
      prize_amount: 1781.25,
      proof_image_url: 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=800&q=80',
      proof_submitted_at: '2026-09-01T14:30:00.000Z',
      proof_status: 'verified',
      admin_notes: 'Verified via club handicap API record.',
      verified_by_user_id: 'user-admin-01',
      verified_at: '2026-09-02T10:00:00.000Z',
      payout_status: 'paid',
      payout_reference: 'STRIPE_TRX_9824719482',
      paid_at: '2026-09-02T11:30:00.000Z',
      created_at: '2026-08-31T20:05:00.000Z'
    }
  ],
  donations: [
    {
      id: 'don-01',
      user_id: 'user-sub-01',
      charity_id: '11111111-1111-1111-1111-111111111111',
      amount: 43.50,
      source_type: 'subscription_allocation',
      stripe_payment_intent_id: 'pi_sub_alloc_01',
      status: 'succeeded',
      donor_name: 'Alexander Cross',
      donor_email: 'alexander@meridian.com',
      created_at: new Date('2026-08-10').toISOString()
    },
    {
      id: 'don-02',
      user_id: null,
      charity_id: '22222222-2222-2222-2222-222222222222',
      amount: 100.00,
      source_type: 'independent_direct',
      stripe_payment_intent_id: 'pi_direct_100_01',
      status: 'succeeded',
      donor_name: 'Anonymous Supporter',
      donor_email: 'supporter@gmail.com',
      created_at: new Date('2026-09-05').toISOString()
    }
  ]
};

// Initialize Supabase Client if credentials are provided, otherwise report fallback mode
if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY && ENV.SUPABASE_URL.startsWith('http')) {
  try {
    supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    isMockDb = false;
    console.log('Supabase Client initialized with Service Role credentials.');
  } catch (err) {
    console.warn('Failed to initialize Supabase client, falling back to in-memory mock repository:', err.message);
    isMockDb = true;
  }
} else {
  console.log('No Supabase service credentials provided in .env - Running in resilient Mock Data Store mode.');
  isMockDb = true;
}

export const getSupabaseClient = () => supabase;
export const isMockDatabase = () => isMockDb;
