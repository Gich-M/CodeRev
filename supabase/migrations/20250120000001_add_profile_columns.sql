-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS weekly_review_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_review_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_review_date timestamptz,
  ADD COLUMN IF NOT EXISTS total_reviews_given integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_submissions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation_points integer DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation_points);
CREATE INDEX IF NOT EXISTS idx_profiles_review_streaks ON public.profiles(weekly_review_streak, monthly_review_streak); 