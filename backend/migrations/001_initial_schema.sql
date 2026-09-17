-- ====================================================================
-- DIGITAL HEROES - Database Schema Migration 001: Initial Schema
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration cleanly
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.winners CASCADE;
DROP TABLE IF EXISTS public.draw_entries CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.charities CASCADE;

-- 3. Charities Table
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    tagline VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    total_raised NUMERIC(12,2) DEFAULT 0.00 CHECK (total_raised >= 0),
    is_featured BOOLEAN DEFAULT FALSE,
    upcoming_events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles Table (Linked 1:1 with Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- Maps directly to auth.users(id)
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    handicap NUMERIC(4,1) DEFAULT 18.0 CHECK (handicap >= -10.0 AND handicap <= 54.0),
    role VARCHAR(20) DEFAULT 'subscriber' CHECK (role IN ('public', 'subscriber', 'admin')),
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_contribution_percent NUMERIC(5,2) DEFAULT 10.00 CHECK (charity_contribution_percent >= 10.00 AND charity_contribution_percent <= 100.00),
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subscriptions Table (Supports multiple lifecycle records per user)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100) UNIQUE NOT NULL,
    stripe_price_id VARCHAR(100) NOT NULL,
    plan_type VARCHAR(30) NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'yearly_discounted')),
    status VARCHAR(25) NOT NULL CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'lapsed', 'trialing', 'incomplete')),
    is_current BOOLEAN DEFAULT TRUE,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status, is_current);

-- 6. Golf Scores Table (Stableford 1-45, 1 per user per date, max 5 FIFO queue)
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    played_at DATE NOT NULL,
    course_name VARCHAR(150) DEFAULT 'Home Club',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_played_at UNIQUE (user_id, played_at)
);

CREATE INDEX idx_scores_user_played_at ON public.scores(user_id, played_at DESC, created_at DESC);

-- 7. Prize Draws Table
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    draw_date TIMESTAMPTZ NOT NULL,
    mode VARCHAR(30) NOT NULL CHECK (mode IN ('random_lottery', 'algorithmic_frequency')),
    status VARCHAR(25) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published', 'archived')),
    winning_numbers INTEGER[], -- Array of 5 unique integers (1-45)
    total_subscribers_eligible INTEGER DEFAULT 0,
    prize_pool_total NUMERIC(12,2) DEFAULT 0.00,
    rollover_from_previous NUMERIC(12,2) DEFAULT 0.00,
    rollover_to_next NUMERIC(12,2) DEFAULT 0.00,
    pool_5_match NUMERIC(12,2) DEFAULT 0.00, -- 40% + rollover
    pool_4_match NUMERIC(12,2) DEFAULT 0.00, -- 35%
    pool_3_match NUMERIC(12,2) DEFAULT 0.00, -- 25%
    charity_distribution_total NUMERIC(12,2) DEFAULT 0.00,
    simulation_meta JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draws_status_date ON public.draws(status, draw_date DESC);

-- 8. Draw Entries Table (Immutable snapshot of subscriber's 5 scores at draw time)
CREATE TABLE public.draw_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_numbers INTEGER[] NOT NULL, -- Array of 5 integers
    matched_count INTEGER DEFAULT 0,
    matched_numbers INTEGER[] DEFAULT '{}',
    tier_won VARCHAR(20) DEFAULT 'none' CHECK (tier_won IN ('none', 'tier_5', 'tier_4', 'tier_3')),
    prize_amount NUMERIC(10,2) DEFAULT 0.00,
    is_snapshot_immutable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_draw_user UNIQUE (draw_id, user_id)
);

CREATE INDEX idx_draw_entries_draw_user ON public.draw_entries(draw_id, user_id);

-- 9. Winners Table (Verification & Payout pipeline)
CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    draw_entry_id UUID REFERENCES public.draw_entries(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('tier_5', 'tier_4', 'tier_3')),
    match_count INTEGER NOT NULL,
    prize_amount NUMERIC(10,2) NOT NULL,
    proof_image_url TEXT,
    proof_submitted_at TIMESTAMPTZ,
    proof_status VARCHAR(25) DEFAULT 'pending_upload' CHECK (proof_status IN ('pending_upload', 'under_review', 'verified', 'rejected')),
    admin_notes TEXT,
    verified_by_user_id UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
    payout_reference VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_draw_winner_tier UNIQUE (draw_id, user_id, tier)
);

CREATE INDEX idx_winners_user_status ON public.winners(user_id, proof_status, payout_status);

-- 10. Donations Table (Subscription allocations & independent direct donations)
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('subscription_allocation', 'independent_direct')),
    stripe_payment_intent_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'succeeded',
    donor_name VARCHAR(150),
    donor_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_charity ON public.donations(charity_id, created_at DESC);
