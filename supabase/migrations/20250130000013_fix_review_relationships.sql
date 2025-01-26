-- First ensure the reviews table has the correct foreign key
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update the reviews query in the CodeSnippet component 