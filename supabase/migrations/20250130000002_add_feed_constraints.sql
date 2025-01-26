-- Add unique constraint to feed_items table
ALTER TABLE public.feed_items
DROP CONSTRAINT IF EXISTS feed_items_reference_user_unique;

ALTER TABLE public.feed_items
ADD CONSTRAINT feed_items_reference_user_unique 
UNIQUE (reference_id, user_id);

-- Add unique constraint to reviews table if not exists
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_snippet_reviewer_unique;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_snippet_reviewer_unique 
UNIQUE (snippet_id, reviewer_id);

-- Update the feed_items table structure
ALTER TABLE public.feed_items
ALTER COLUMN reference_id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL; 