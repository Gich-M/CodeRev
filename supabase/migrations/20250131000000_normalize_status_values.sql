-- Update existing statuses to be consistent
UPDATE code_snippets
SET status = 'approved'
WHERE status = 'completed';

-- Add check constraint to ensure valid status values
ALTER TABLE code_snippets
DROP CONSTRAINT IF EXISTS code_snippets_status_check;

ALTER TABLE code_snippets
ADD CONSTRAINT code_snippets_status_check
CHECK (status IN ('pending', 'approved', 'changes_requested')); 