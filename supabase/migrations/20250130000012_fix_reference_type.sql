-- Update the trigger function to use correct reference type
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
      WHEN NEW.status = 'changes_requested' THEN 'Changes Requested'
      ELSE 'Review Completed'
    END,
    NEW.comment,
    'code_snippet',  -- Changed from 'review' to 'code_snippet'
    NEW.snippet_id,  -- Changed from NEW.id to NEW.snippet_id
    NEW.snippet_id,
    jsonb_build_object(
      'status', NEW.status,
      'reviewer', (SELECT username FROM profiles WHERE id = NEW.reviewer_id)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 