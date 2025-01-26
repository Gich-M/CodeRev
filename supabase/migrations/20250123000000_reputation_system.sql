-- Reputation and Achievements System

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  points_value integer NOT NULL DEFAULT 0,
  icon_name text,
  category text CHECK (category IN ('review', 'submission', 'community', 'streak')),
  requirements jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Reputation history table
CREATE TABLE IF NOT EXISTS public.reputation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  reference_type text NOT NULL CHECK (reference_type IN ('review', 'submission', 'achievement', 'streak')),
  reference_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS weekly_review_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_review_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_review_date timestamptz,
  ADD COLUMN IF NOT EXISTS total_reviews_given integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_submissions integer DEFAULT 0;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view own reputation history"
  ON public.reputation_history FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON public.reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created_at ON public.reputation_history(created_at); 