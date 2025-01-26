-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_feed_item;

-- Create new function with upsert logic
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
  ON CONFLICT (reference_id, user_id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING id INTO v_feed_item_id;

  RETURN v_feed_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_feed_item TO authenticated;

-- Update the feed_items table to ensure proper constraints
ALTER TABLE feed_items
DROP CONSTRAINT IF EXISTS feed_items_reference_user_unique,
ADD CONSTRAINT feed_items_reference_user_unique 
  UNIQUE (reference_id, user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_feed_items_reference_user 
ON feed_items(reference_id, user_id); 