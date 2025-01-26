-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid REFERENCES public.code_snippets(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

-- Create or update RLS Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND indexname = 'idx_reviews_snippet_id'
  ) THEN
    CREATE INDEX idx_reviews_snippet_id ON public.reviews(snippet_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND indexname = 'idx_reviews_reviewer_id'
  ) THEN
    CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND indexname = 'idx_reviews_created_at'
  ) THEN
    CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);
  END IF;
END $$;

-- Drop view if it exists
DROP VIEW IF EXISTS public.reviews_with_profiles;

-- Create or replace the view
CREATE VIEW public.reviews_with_profiles AS
SELECT 
  r.*,
  p.username,
  p.avatar_url
FROM 
  public.reviews r
  LEFT JOIN public.profiles p ON r.reviewer_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.reviews_with_profiles TO authenticated; 