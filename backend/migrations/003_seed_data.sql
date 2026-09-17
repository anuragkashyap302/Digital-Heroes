-- ====================================================================
-- DIGITAL HEROES - Database Migration 003: Seed Data
-- ====================================================================

-- 1. Seed Charities
INSERT INTO public.charities (id, name, slug, category, tagline, description, logo_url, banner_url, website_url, total_raised, is_featured, upcoming_events)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Fairway Foundation for Youth',
    'fairway-foundation-for-youth',
    'Youth & Education',
    'Empowering underprivileged youth through mentorship, golf accessibility, and academic scholarships.',
    'The Fairway Foundation breaks socioeconomic barriers by introducing young people from diverse urban communities to the discipline, life skills, and career networks fostered through the game of golf. Every contribution funds equipment, PGA junior coaching, and university STEM scholarships.',
    'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    'https://fairwayyouth.org',
    18450.00,
    true,
    '[
        {"id": "ev-1", "title": "Junior Summer Championship & Gala", "date": "2026-10-15", "location": "Wentworth Club, Surrey", "description": "Annual charity scramble pairing junior proteges with tour professionals."},
        {"id": "ev-2", "title": "STEM in Sport Youth Workshop", "date": "2026-11-08", "location": "Birmingham National Arena", "description": "Interactive workshop exploring biomechanics, data analytics, and sports science."}
    ]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Green Greens Conservation Trust',
    'green-greens-conservation-trust',
    'Environmental Protection',
    'Restoring natural biodiversity and pollinator corridors across protected open landscapes.',
    'Green Greens Conservation Trust partners with golf courses, wetlands, and nature reserves to eliminate harmful runoff, restore native flora, build solar-powered water capture, and safeguard endangered pollinator populations across over 40,000 hectares of green spaces.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'https://greengreens.org',
    12900.00,
    true,
    '[
        {"id": "ev-3", "title": "Rewilding the Links Symposium", "date": "2026-10-22", "location": "St Andrews Ecology Center", "description": "Global summit on sustainable turf management and coastal dune preservation."}
    ]'::jsonb
),
(
    '33333333-3333-3333-3333-333333333333',
    'Veterans On Course Project',
    'veterans-on-course-project',
    'Veterans & Mental Health',
    'Rehabilitation, mental wellness, and community reintegration for wounded service personnel.',
    'Veterans On Course harnesses the therapeutic calm of outdoor sports and peer camaraderie to support military veterans overcoming PTSD, physical injury, and social isolation. We provide adaptive equipment, clinical support sessions, and vocational pathways.',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80',
    'https://veteranscourse.org',
    21350.00,
    false,
    '[
        {"id": "ev-4", "title": "Heroes Invitational Scramble", "date": "2026-11-14", "location": "Celtic Manor Resort, Wales", "description": "36-hole charity team event honoring veterans and raising mental health support funds."}
    ]'::jsonb
),
(
    '44444444-4444-4444-4444-444444444444',
    'Cure Heart Global Initiative',
    'cure-heart-global-initiative',
    'Medical & Health Research',
    'Accelerating groundbreaking cardiovascular research and community heart health screenings.',
    'Cure Heart Global Initiative funds early-detection heart disease screening vans and cutting-edge clinical trials to prevent sudden cardiac arrest in active athletes and community members of all ages.',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    'https://cureheartglobal.org',
    9750.00,
    false,
    '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Past Published Draws
INSERT INTO public.draws (id, draw_number, name, draw_date, mode, status, winning_numbers, total_subscribers_eligible, prize_pool_total, rollover_from_previous, rollover_to_next, pool_5_match, pool_4_match, pool_3_match, charity_distribution_total, published_at)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    101,
    'Digital Heroes July Impact Draw #101',
    '2026-07-31 20:00:00+00',
    'random_lottery',
    'published',
    ARRAY[14, 22, 28, 35, 41],
    240,
    12000.00,
    0.00,
    4800.00, -- 5-match was unclaimed, rolled over £4,800 (40%)
    4800.00,
    4200.00, -- 35%
    3000.00, -- 25%
    2400.00,
    '2026-07-31 20:05:00+00'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    102,
    'Digital Heroes August Impact Draw #102',
    '2026-08-31 20:00:00+00',
    'algorithmic_frequency',
    'published',
    ARRAY[9, 18, 27, 34, 42],
    285,
    19050.00,
    4800.00, -- rolled over from #101
    0.00,    -- 5-match won! No rollover to #103
    10500.00, -- 40% of 14,250 + 4,800 rollover = 10,500
    4987.50,  -- 35%
    3562.50,  -- 25%
    2850.00,
    '2026-08-31 20:05:00+00'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    103,
    'Digital Heroes September Grand Draw #103',
    '2026-09-30 20:00:00+00',
    'random_lottery',
    'draft',
    NULL,
    310,
    15500.00,
    0.00,
    0.00,
    6200.00, -- 40%
    5425.00, -- 35%
    3875.00, -- 25%
    3100.00,
    NULL
)
ON CONFLICT (id) DO NOTHING;
