-- First drop existing constraint and index
ALTER TABLE feed_items 
DROP CONSTRAINT IF EXISTS feed_items_reference_user_unique;

DROP INDEX IF EXISTS idx_feed_items_reference_user;

-- Add new composite unique constraint that includes type
ALTER TABLE feed_items
ADD CONSTRAINT feed_items_unique_submission 
UNIQUE (type, reference_id, user_id, code_snippet_id);

-- Update the feed item creation function
CREATE OR REPLACE FUNCTION create_feed_item(
  p_type text,
  p_title text,
  p_description text,
  p_reference_type text,
  p_reference_id uuid,
  p_code_snippet_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_visibility text[] DEFAULT '{public}'::text[],
  p_cohort_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_feed_item_id uuid;
BEGIN
  -- Delete any existing feed items for this submission
  DELETE FROM feed_items 
  WHERE type = p_type::feed_item_type 
  AND reference_id = p_reference_id 
  AND user_id = auth.uid()
  AND code_snippet_id = p_code_snippet_id;

  -- Insert new feed item
  INSERT INTO feed_items (
    type,
    user_id,
    title,
    description,
    reference_type,
    reference_id,
    code_snippet_id,
    metadata,
    visibility,
    cohort_id
  ) VALUES (
    p_type::feed_item_type,
    auth.uid(),
    p_title,
    p_description,
    p_reference_type,
    p_reference_id,
    p_code_snippet_id,
    p_metadata,
    p_visibility,
    p_cohort_id
  )
  RETURNING id INTO v_feed_item_id;

  RETURN v_feed_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add new index for performance
CREATE INDEX IF NOT EXISTS idx_feed_items_composite 
ON feed_items(type, reference_id, user_id, code_snippet_id); 