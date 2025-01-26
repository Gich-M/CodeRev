-- Add unique constraint to reviews table
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