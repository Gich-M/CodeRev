-- Create code snippets table
CREATE TABLE public.code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  code_content text NOT NULL,
  language text NOT NULL,
  status text DEFAULT 'pending',
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Code snippets are viewable by everyone"
  ON public.code_snippets FOR SELECT
  USING (true);

CREATE POLICY "Users can create code snippets"
  ON public.code_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own code snippets"
  ON public.code_snippets FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_code_snippets_user_id ON public.code_snippets(user_id);
CREATE INDEX idx_code_snippets_language ON public.code_snippets(language);
CREATE INDEX idx_code_snippets_status ON public.code_snippets(status);
CREATE INDEX idx_code_snippets_created_at ON public.code_snippets(created_at); 