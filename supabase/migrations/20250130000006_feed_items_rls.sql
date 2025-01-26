-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view feed items" ON feed_items;
DROP POLICY IF EXISTS "Users can create feed items" ON feed_items;
DROP POLICY IF EXISTS "Users can update own feed items" ON feed_items;
DROP POLICY IF EXISTS "Users can delete own feed items" ON feed_items;

-- Enable RLS on feed_items table
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view feed items"
ON feed_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create feed items"
ON feed_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feed items"
ON feed_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feed items"
ON feed_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 