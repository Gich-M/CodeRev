-- First, clean up duplicate feed items
DO $$ 
BEGIN
  -- Delete duplicates keeping only the latest entries
  DELETE FROM public.feed_items
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
        ROW_NUMBER() OVER (
          PARTITION BY reference_id, user_id
          ORDER BY created_at DESC
        ) as row_num
      FROM public.feed_items
    ) t
    WHERE t.row_num > 1
  );
END $$;

-- Now add the constraints
ALTER TABLE public.feed_items
DROP CONSTRAINT IF EXISTS feed_items_reference_user_unique;

ALTER TABLE public.feed_items
ADD CONSTRAINT feed_items_reference_user_unique 
UNIQUE (reference_id, user_id);

-- Set NOT NULL constraints
ALTER TABLE public.feed_items
ALTER COLUMN reference_id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL; 