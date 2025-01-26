-- Drop existing views
DROP VIEW IF EXISTS reviews_with_details;
DROP VIEW IF EXISTS code_snippets_with_details;

-- Create view for code snippets with author details
CREATE OR REPLACE VIEW code_snippets_with_details AS
SELECT 
  s.*,
  p.username as author_username,
  p.avatar_url as author_avatar_url
FROM code_snippets s
LEFT JOIN profiles p ON s.user_id = p.id;

-- Create view for reviews with reviewer details
CREATE OR REPLACE VIEW reviews_with_details AS
SELECT 
  r.*,
  p.username as reviewer_username,
  p.avatar_url as reviewer_avatar_url,
  cs.user_id as snippet_author_id,
  author.username as snippet_author_username,
  author.avatar_url as snippet_author_avatar_url
FROM reviews r
LEFT JOIN profiles p ON r.reviewer_id = p.id
LEFT JOIN code_snippets cs ON r.snippet_id = cs.id
LEFT JOIN profiles author ON cs.user_id = author.id;

-- Grant access to the views
GRANT SELECT ON code_snippets_with_details TO authenticated;
GRANT SELECT ON reviews_with_details TO authenticated; 