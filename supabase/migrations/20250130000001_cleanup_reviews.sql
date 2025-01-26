-- First, identify the latest review for each snippet-reviewer pair
WITH latest_reviews AS (
  SELECT DISTINCT ON (snippet_id, reviewer_id)
    id,
    snippet_id,
    reviewer_id,
    created_at
  FROM public.reviews
  ORDER BY snippet_id, reviewer_id, created_at DESC
),
-- Delete all reviews except the latest ones
cleanup AS (
  DELETE FROM public.reviews
  WHERE id NOT IN (
    SELECT id FROM latest_reviews
  )
)
-- Now we can safely add the unique constraint
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_snippet_reviewer_unique;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_snippet_reviewer_unique 
UNIQUE (snippet_id, reviewer_id);

-- Add check constraint to prevent self-reviews
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_no_self_reviews;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_no_self_reviews
CHECK (
  reviewer_id != (
    SELECT user_id 
    FROM code_snippets 
    WHERE id = snippet_id
  )
); 