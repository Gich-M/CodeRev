-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.create_feed_item;

-- Create the function with proper parameter types
CREATE OR REPLACE FUNCTION public.create_feed_item(
  p_type text, -- Changed from feed_item_type to text for flexibility
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
  -- Cast the type to feed_item_type enum
  INSERT INTO public.feed_items (
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
  )
  VALUES (
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