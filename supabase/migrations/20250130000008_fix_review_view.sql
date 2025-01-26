-- First drop the existing view
DROP VIEW IF EXISTS reviews_with_profiles;

-- Recreate the view with correct column names
CREATE VIEW reviews_with_profiles AS
SELECT 
  r.id,
  r.snippet_id,
  r.reviewer_id,
  r.comment,
  r.status,
  r.created_at,
  r.updated_at,
  p.username,
  p.avatar_url,
  p.reputation_points
FROM reviews r
LEFT JOIN profiles p ON r.reviewer_id = p.id;

-- Grant access to the view
GRANT SELECT ON reviews_with_profiles TO authenticated;

-- Update the trigger function to handle both comment and status
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
    CASE 
      WHEN NEW.status = 'approved' THEN 'Code Review Approved'
      WHEN NEW.status = 'rejected' THEN 'Changes Requested'
      ELSE 'Review Completed'
    END,
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