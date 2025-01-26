-- Drop existing foreign key constraints
ALTER TABLE public.feed_items 
  DROP CONSTRAINT IF EXISTS feed_items_reference_id_fkey;

ALTER TABLE public.comments 
  DROP CONSTRAINT IF EXISTS comments_snippet_id_fkey;

ALTER TABLE public.reviews 
  DROP CONSTRAINT IF EXISTS reviews_snippet_id_fkey;

-- Recreate constraints with proper cascade delete
ALTER TABLE public.feed_items
  ADD CONSTRAINT feed_items_reference_id_fkey 
  FOREIGN KEY (reference_id) 
  REFERENCES public.code_snippets(id) 
  ON DELETE CASCADE;

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

-- Add RLS policies for delete
CREATE POLICY "Users can delete own feed items"
  ON public.feed_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id); 