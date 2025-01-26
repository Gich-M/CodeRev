-- Add review_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'code_snippets' 
    AND column_name = 'review_count'
  ) THEN
    ALTER TABLE public.code_snippets 
    ADD COLUMN review_count integer DEFAULT 0;
  END IF;
END $$;

-- Add missing indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'code_snippets' 
    AND indexname = 'idx_code_snippets_language'
  ) THEN
    CREATE INDEX idx_code_snippets_language ON public.code_snippets(language);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'code_snippets' 
    AND indexname = 'idx_code_snippets_status'
  ) THEN
    CREATE INDEX idx_code_snippets_status ON public.code_snippets(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'code_snippets' 
    AND indexname = 'idx_code_snippets_created_at'
  ) THEN
    CREATE INDEX idx_code_snippets_created_at ON public.code_snippets(created_at);
  END IF;
END $$;

-- Update or create RLS policies
DROP POLICY IF EXISTS "Code snippets are viewable by everyone" ON public.code_snippets;
CREATE POLICY "Code snippets are viewable by everyone"
  ON public.code_snippets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create code snippets" ON public.code_snippets;
CREATE POLICY "Users can create code snippets"
  ON public.code_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own code snippets" ON public.code_snippets;
CREATE POLICY "Users can update own code snippets"
  ON public.code_snippets FOR UPDATE
  USING (auth.uid() = user_id); 