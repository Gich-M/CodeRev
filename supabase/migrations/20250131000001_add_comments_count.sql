-- First add the comments_count column if it doesn't exist
ALTER TABLE code_snippets 
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Update existing comment counts
UPDATE code_snippets cs
SET comment_count = (
  SELECT COUNT(*)
  FROM comments c
  WHERE c.snippet_id = cs.id
);

-- Create function to maintain comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE code_snippets
    SET comment_count = comment_count + 1
    WHERE id = NEW.snippet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE code_snippets
    SET comment_count = comment_count - 1
    WHERE id = OLD.snippet_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for comment count
DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count(); 