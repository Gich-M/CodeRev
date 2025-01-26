-- Add code_snippet_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feed_items' 
    AND column_name = 'code_snippet_id'
  ) THEN
    ALTER TABLE public.feed_items 
    ADD COLUMN code_snippet_id uuid;
  END IF;
END $$;

-- Drop existing foreign key if it exists
ALTER TABLE public.feed_items 
DROP CONSTRAINT IF EXISTS feed_items_code_snippet_id_fkey;

-- Add the foreign key constraint with proper reference
ALTER TABLE public.feed_items
ADD CONSTRAINT feed_items_code_snippet_id_fkey 
FOREIGN KEY (code_snippet_id) 
REFERENCES public.code_snippets(id) 
ON DELETE CASCADE;

-- Update existing feed items to link to code snippets
UPDATE public.feed_items
SET code_snippet_id = reference_id
WHERE reference_type = 'code_snippet'
AND code_snippet_id IS NULL;

-- Create or replace the function to handle new submissions
CREATE OR REPLACE FUNCTION public.handle_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_feed_item(
    'new_submission',
    NEW.title,
    NEW.description,
    'code_snippet',
    NEW.id,
    NEW.id,
    jsonb_build_object(
      'language', NEW.language,
      'user_name', (SELECT username FROM public.profiles WHERE id = NEW.user_id)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh the trigger
DROP TRIGGER IF EXISTS on_code_snippet_created ON public.code_snippets;
CREATE TRIGGER on_code_snippet_created
  AFTER INSERT ON public.code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_submission();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_feed_items_code_snippet_id 
ON public.feed_items(code_snippet_id); 