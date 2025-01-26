-- Rename content to comment if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE public.reviews RENAME COLUMN content TO comment;
  END IF;
END $$;

-- Add comment column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews' 
    AND column_name = 'comment'
  ) THEN
    ALTER TABLE public.reviews ADD COLUMN comment text NOT NULL;
  END IF;
END $$;

-- Recreate the view
DROP VIEW IF EXISTS public.reviews_with_profiles;
CREATE VIEW public.reviews_with_profiles AS
SELECT 
  r.id,
  r.snippet_id,
  r.reviewer_id,
  r.comment,
  r.status,
  r.created_at,
  r.updated_at,
  p.username,
  p.avatar_url
FROM 
  public.reviews r
  LEFT JOIN public.profiles p ON r.reviewer_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.reviews_with_profiles TO authenticated; 