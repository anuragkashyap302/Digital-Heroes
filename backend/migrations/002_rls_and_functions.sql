-- ====================================================================
-- DIGITAL HEROES - Database Migration 002: Row Level Security & Functions
-- ====================================================================

-- 1. Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 2. Admin verification function (Security Definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins full profiles access" ON public.profiles;

CREATE POLICY "Users view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Service role & Admins insert profiles" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. Charities Policies
DROP POLICY IF EXISTS "Charities public read" ON public.charities;
DROP POLICY IF EXISTS "Charities admin write" ON public.charities;

CREATE POLICY "Charities public read" 
    ON public.charities FOR SELECT 
    USING (true);

CREATE POLICY "Charities admin write" 
    ON public.charities FOR ALL 
    USING (public.is_admin());

-- 5. Subscriptions Policies
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;

CREATE POLICY "Users view own subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage subscriptions" 
    ON public.subscriptions FOR ALL 
    USING (public.is_admin());

-- 6. Golf Scores Policies
DROP POLICY IF EXISTS "Users manage own scores" ON public.scores;
DROP POLICY IF EXISTS "Admins view all scores" ON public.scores;

CREATE POLICY "Users manage own scores" 
    ON public.scores FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 7. Draws Policies
DROP POLICY IF EXISTS "Published draws are public" ON public.draws;
DROP POLICY IF EXISTS "Admins manage all draws" ON public.draws;

CREATE POLICY "Published draws are public" 
    ON public.draws FOR SELECT 
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage all draws" 
    ON public.draws FOR ALL 
    USING (public.is_admin());

-- 8. Draw Entries Policies
DROP POLICY IF EXISTS "Users view own draw entries" ON public.draw_entries;
DROP POLICY IF EXISTS "Admins manage draw entries" ON public.draw_entries;

CREATE POLICY "Users view own draw entries" 
    ON public.draw_entries FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage draw entries" 
    ON public.draw_entries FOR ALL 
    USING (public.is_admin());

-- 9. Winners Policies
DROP POLICY IF EXISTS "Winners public or owner read" ON public.winners;
DROP POLICY IF EXISTS "Winners submit proof" ON public.winners;
DROP POLICY IF EXISTS "Admins manage winners" ON public.winners;

CREATE POLICY "Winners public or owner read" 
    ON public.winners FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin() OR EXISTS (
        SELECT 1 FROM public.draws WHERE public.draws.id = public.winners.draw_id AND public.draws.status = 'published'
    ));

CREATE POLICY "Winners submit proof" 
    ON public.winners FOR UPDATE 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage winners" 
    ON public.winners FOR ALL 
    USING (public.is_admin());

-- 10. Donations Policies
DROP POLICY IF EXISTS "Public can create donations" ON public.donations;
DROP POLICY IF EXISTS "Users view own donations" ON public.donations;

CREATE POLICY "Public can create donations" 
    ON public.donations FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users view own donations" 
    ON public.donations FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

-- 11. Transactional FIFO Score Management Database Function
CREATE OR REPLACE FUNCTION public.add_score_fifo(
    p_user_id UUID,
    p_score INT,
    p_played_at DATE,
    p_course_name VARCHAR(150),
    p_notes TEXT
)
RETURNS SETOF public.scores AS $$
DECLARE
    v_new_id UUID;
BEGIN
    -- Check constraints
    IF p_score < 1 OR p_score > 45 THEN
        RAISE EXCEPTION 'Score must be between 1 and 45 points.';
    END IF;

    -- Insert new score (fails on duplicate date due to UNIQUE constraint)
    INSERT INTO public.scores (user_id, score, played_at, course_name, notes)
    VALUES (p_user_id, p_score, p_played_at, COALESCE(p_course_name, 'Home Club'), p_notes)
    RETURNING id INTO v_new_id;

    -- Evict scores beyond the latest 5 (ordered by played_at DESC, created_at DESC)
    DELETE FROM public.scores
    WHERE user_id = p_user_id
      AND id NOT IN (
          SELECT id FROM public.scores
          WHERE user_id = p_user_id
          ORDER BY played_at DESC, created_at DESC
          LIMIT 5
      );

    -- Return the updated 5 scores in reverse chronological order
    RETURN QUERY
    SELECT * FROM public.scores
    WHERE user_id = p_user_id
    ORDER BY played_at DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
