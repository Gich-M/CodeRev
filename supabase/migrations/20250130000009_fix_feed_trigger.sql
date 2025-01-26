-- Update the trigger function to use upsert instead of insert
CREATE OR REPLACE FUNCTION update_snippet_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the snippet status based on the review
  UPDATE code_snippets
  SET status = NEW.status
  WHERE id = NEW.snippet_id;
  
  -- Upsert the feed item for the review
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
      WHEN NEW.status = 'changes_requested' THEN 'Changes Requested'
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
  )
  ON CONFLICT (reference_id, user_id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_review_status_update ON reviews;
CREATE TRIGGER on_review_status_update
  AFTER INSERT OR UPDATE OF status
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_snippet_status(); 