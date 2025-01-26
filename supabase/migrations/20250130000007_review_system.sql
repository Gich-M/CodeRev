-- Add status column to reviews if not exists
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create a view for reviews with user info
CREATE OR REPLACE VIEW reviews_with_profiles AS
SELECT 
  r.*,
  p.username,
  p.avatar_url,
  p.reputation_points
FROM reviews r
LEFT JOIN profiles p ON r.reviewer_id = p.id;

-- Update RLS policies for reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id AND
  reviewer_id != (
    SELECT user_id 
    FROM code_snippets 
    WHERE id = snippet_id
  )
);

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

-- Function to update snippet status based on reviews
CREATE OR REPLACE FUNCTION update_snippet_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the snippet status based on the review
  UPDATE code_snippets
  SET status = NEW.status
  WHERE id = NEW.snippet_id;
  
  -- Create a feed item for the review
  INSERT INTO feed_items (
    type,
    user_id,
    title,
    description,
    reference_type,
    reference_id,
    code_snippet_id,
    metadata
  ) VALUES (
    'review_completed',
    NEW.reviewer_id,
    'Review Completed',
    NEW.comment,
    'review',
    NEW.id,
    NEW.snippet_id,
    jsonb_build_object(
      'status', NEW.status,
      'reviewer', (SELECT username FROM profiles WHERE id = NEW.reviewer_id)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for review status updates
DROP TRIGGER IF EXISTS on_review_status_update ON reviews;
CREATE TRIGGER on_review_status_update
  AFTER INSERT OR UPDATE OF status
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_snippet_status(); 