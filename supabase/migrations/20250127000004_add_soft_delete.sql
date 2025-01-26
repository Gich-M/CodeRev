-- Add deleted column to auth.users if it doesn't exist
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT false;

-- Update the trigger function to handle soft deletes
CREATE OR REPLACE FUNCTION handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted = true THEN
    -- Delete from profiles
    DELETE FROM public.profiles WHERE id = OLD.id;
    
    -- Delete from reviews
    DELETE FROM public.reviews WHERE reviewer_id = OLD.id;
    
    -- Delete from code_snippets
    DELETE FROM public.code_snippets WHERE user_id = OLD.id;
    
    -- Delete from user_settings
    DELETE FROM public.user_settings WHERE user_id = OLD.id;
    
    -- Delete from user_achievements
    DELETE FROM public.user_achievements WHERE user_id = OLD.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
CREATE TRIGGER on_user_deleted
  AFTER UPDATE OF deleted ON auth.users
  FOR EACH ROW
  WHEN (NEW.deleted = true)
  EXECUTE FUNCTION handle_user_deleted(); 