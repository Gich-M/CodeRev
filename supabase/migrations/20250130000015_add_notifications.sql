-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_type_check 
    CHECK (type IN ('review_status_changed', 'new_review', 'new_comment'))
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to create notification on review status change
CREATE OR REPLACE FUNCTION notify_review_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the snippet owner's ID
  WITH snippet_info AS (
    SELECT 
      cs.user_id as owner_id,
      cs.title as snippet_title,
      p.username as reviewer_username
    FROM code_snippets cs
    LEFT JOIN profiles p ON p.id = NEW.reviewer_id
    WHERE cs.id = NEW.snippet_id
  )
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    reference_type,
    reference_id,
    metadata
  )
  SELECT
    owner_id,
    'review_status_changed',
    CASE 
      WHEN NEW.status = 'approved' THEN 'Review Approved'
      WHEN NEW.status = 'changes_requested' THEN 'Changes Requested'
      ELSE 'Review Updated'
    END,
    CASE 
      WHEN NEW.status = 'approved' 
        THEN reviewer_username || ' approved your code snippet: ' || snippet_title
      WHEN NEW.status = 'changes_requested' 
        THEN reviewer_username || ' requested changes to: ' || snippet_title
      ELSE reviewer_username || ' updated their review of: ' || snippet_title
    END,
    'code_snippet',
    NEW.snippet_id,
    jsonb_build_object(
      'review_id', NEW.id,
      'status', NEW.status,
      'reviewer_username', reviewer_username,
      'snippet_title', snippet_title
    )
  FROM snippet_info
  WHERE owner_id != NEW.reviewer_id; -- Don't notify if reviewing own snippet

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
DROP TRIGGER IF EXISTS on_review_status_change ON reviews;
CREATE TRIGGER on_review_status_change
  AFTER INSERT OR UPDATE OF status
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_status_change(); 