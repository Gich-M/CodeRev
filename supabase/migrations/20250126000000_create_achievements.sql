-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  points_value integer NOT NULL DEFAULT 0,
  category text CHECK (category IN ('review', 'submission', 'community', 'streak')),
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon_name, points_value, category) VALUES
  ('First Review', 'Completed your first code review', 'star', 50, 'review'),
  ('Code Master', 'Submitted 10 code snippets', 'code', 100, 'submission'),
  ('Helpful Reviewer', 'Received 5 helpful review ratings', 'thumbs-up', 150, 'review'),
  ('Rising Star', 'Earned 500 reputation points', 'zap', 200, 'community'),
  ('Streak Master', 'Maintained a 7-day review streak', 'target', 250, 'streak'),
  ('Community Leader', 'Helped 50 developers improve their code', 'trophy', 500, 'community')
ON CONFLICT DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id); 