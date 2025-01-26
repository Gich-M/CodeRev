-- First, drop the category check constraint if it exists
ALTER TABLE public.achievements 
  DROP CONSTRAINT IF EXISTS achievements_category_check;

-- Then add the category column if it doesn't exist
ALTER TABLE public.achievements 
  ADD COLUMN IF NOT EXISTS category text;

-- Update existing achievements with categories
UPDATE public.achievements SET category = 
  CASE 
    WHEN name ILIKE '%review%' THEN 'review'
    WHEN name ILIKE '%code%' THEN 'submission'
    WHEN name ILIKE '%streak%' THEN 'streak'
    ELSE 'community'
  END
WHERE category IS NULL;

-- Now add the check constraint
ALTER TABLE public.achievements 
  ADD CONSTRAINT achievements_category_check 
  CHECK (category IN ('review', 'submission', 'community', 'streak'));

-- Recreate the achievements if needed
INSERT INTO public.achievements (name, description, icon_name, points_value, category) 
VALUES 
  ('First Review', 'Completed your first code review', 'star', 50, 'review'),
  ('Code Master', 'Submitted 10 code snippets', 'code', 100, 'submission'),
  ('Helpful Reviewer', 'Received 5 helpful review ratings', 'thumbs-up', 150, 'review'),
  ('Rising Star', 'Earned 500 reputation points', 'zap', 200, 'community'),
  ('Streak Master', 'Maintained a 7-day review streak', 'target', 250, 'streak'),
  ('Community Leader', 'Helped 50 developers improve their code', 'trophy', 500, 'community')
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  points_value = EXCLUDED.points_value,
  category = EXCLUDED.category; 