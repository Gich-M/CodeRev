-- Add foreign key constraint for author relationship
ALTER TABLE code_snippets
DROP CONSTRAINT IF EXISTS code_snippets_user_id_fkey;

ALTER TABLE code_snippets
ADD CONSTRAINT code_snippets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update the snippet query to use the correct relationship
CREATE OR REPLACE VIEW code_snippets_with_details AS
SELECT 
  s.*,
  p.username as author_username,
  p.avatar_url as author_avatar_url
FROM code_snippets s
LEFT JOIN profiles p ON s.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON code_snippets_with_details TO authenticated; 