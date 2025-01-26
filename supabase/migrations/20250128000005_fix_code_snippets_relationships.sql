-- Add foreign key relationship between code_snippets and profiles
ALTER TABLE public.code_snippets
DROP CONSTRAINT IF EXISTS code_snippets_user_id_fkey;

ALTER TABLE public.code_snippets
ADD CONSTRAINT code_snippets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for the user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'code_snippets' 
    AND indexname = 'idx_code_snippets_user_id'
  ) THEN
    CREATE INDEX idx_code_snippets_user_id ON public.code_snippets(user_id);
  END IF;
END $$;

-- Create a view to join code_snippets with profiles
CREATE OR REPLACE VIEW public.code_snippets_with_profiles AS
SELECT 
  cs.*,
  p.username,
  p.avatar_url
FROM 
  public.code_snippets cs
  LEFT JOIN public.profiles p ON cs.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.code_snippets_with_profiles TO authenticated; 