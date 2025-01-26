-- Drop existing foreign key constraints
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_snippet_id_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_snippet_id_fkey;
ALTER TABLE public.feed_items DROP CONSTRAINT IF EXISTS feed_items_reference_id_fkey;

-- Recreate foreign key constraints with CASCADE
ALTER TABLE public.comments
  ADD CONSTRAINT comments_snippet_id_fkey
  FOREIGN KEY (snippet_id)
  REFERENCES public.code_snippets(id)
  ON DELETE CASCADE;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_snippet_id_fkey
  FOREIGN KEY (snippet_id)
  REFERENCES public.code_snippets(id)
  ON DELETE CASCADE;

-- Add constraint for feed items
ALTER TABLE public.feed_items
  ADD CONSTRAINT feed_items_reference_id_fkey
  FOREIGN KEY (reference_id)
  REFERENCES public.code_snippets(id)
  ON DELETE CASCADE;

-- Add check constraint for reference type
ALTER TABLE public.feed_items
  ADD CONSTRAINT feed_items_reference_type_check
  CHECK (reference_type IN ('code_snippet', 'achievement', 'discussion'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_snippet_user ON public.comments(snippet_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_snippet_user ON public.reviews(snippet_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_reference ON public.feed_items(reference_id, reference_type); 