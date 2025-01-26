-- Create a trigger function to handle cascading deletes
CREATE OR REPLACE FUNCTION handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
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
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_deleted_user();

-- Add policy to allow users to delete their own data
CREATE POLICY "Users can delete own data"
  ON auth.users
  FOR DELETE
  USING (auth.uid() = id); 