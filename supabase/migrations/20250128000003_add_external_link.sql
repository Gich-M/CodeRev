-- Add external_link column to code_snippets
ALTER TABLE public.code_snippets
ADD COLUMN IF NOT EXISTS external_link text; 