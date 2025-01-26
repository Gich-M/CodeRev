-- Add cascade delete to feed_items
ALTER TABLE public.feed_items
DROP CONSTRAINT IF EXISTS feed_items_reference_id_fkey,
ADD CONSTRAINT feed_items_reference_id_fkey 
  FOREIGN KEY (reference_id) 
  REFERENCES public.code_snippets(id) 
  ON DELETE CASCADE;

-- Add cascade delete to comments
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_snippet_id_fkey,
ADD CONSTRAINT comments_snippet_id_fkey 
  FOREIGN KEY (snippet_id) 
  REFERENCES public.code_snippets(id) 
  ON DELETE CASCADE;

-- Add cascade delete to reviews
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_snippet_id_fkey,
ADD CONSTRAINT reviews_snippet_id_fkey 
  FOREIGN KEY (snippet_id) 
  REFERENCES public.code_snippets(id) 
  ON DELETE CASCADE; 