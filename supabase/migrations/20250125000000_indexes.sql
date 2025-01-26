-- Performance Optimization Indexes

-- Code Snippets Indexes
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON public.code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_status ON public.code_snippets(status);
CREATE INDEX IF NOT EXISTS idx_code_snippets_created_at ON public.code_snippets(created_at);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON public.code_snippets(language);

-- Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_snippet_id ON public.reviews(snippet_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Comments Indexes
CREATE INDEX IF NOT EXISTS idx_comments_snippet_id ON public.comments(snippet_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Profile Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation_points ON public.profiles(reputation_points);

-- Tags Indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_snippet_tags_snippet_id ON public.snippet_tags(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_tags_tag_id ON public.snippet_tags(tag_id);

-- Add updated_at triggers to all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END $$; 