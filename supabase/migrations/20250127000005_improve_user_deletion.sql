-- Add deleted_at column to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create a function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(input_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete from reviews
  DELETE FROM public.reviews 
  WHERE reviewer_id = input_user_id;

  -- Delete from code_snippets
  DELETE FROM public.code_snippets 
  WHERE user_id = input_user_id;

  -- Delete from user_settings
  DELETE FROM public.user_settings 
  WHERE user_id = input_user_id;

  -- Delete from user_achievements
  DELETE FROM public.user_achievements 
  WHERE user_id = input_user_id;

  -- Delete from profiles
  DELETE FROM public.profiles 
  WHERE id = input_user_id;

  -- Disable the user's ability to log in
  UPDATE auth.users 
  SET 
    raw_app_meta_data = raw_app_meta_data || 
      jsonb_build_object(
        'provider', 'deleted',
        'providers', array['deleted']
      ),
    raw_user_meta_data = raw_user_meta_data || 
      jsonb_build_object(
        'deleted', true,
        'deleted_at', CURRENT_TIMESTAMP
      ),
    email = 'deleted_' || auth.users.id || '@deleted.com',
    encrypted_password = NULL,
    email_confirmed_at = NULL,
    confirmation_token = NULL,
    recovery_token = NULL,
    aud = 'deleted'
  WHERE id = input_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data TO authenticated;

-- Add a policy to prevent deleted users from logging in
CREATE OR REPLACE FUNCTION auth.check_user_not_deleted()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = NEW.user_id 
    AND (auth.users.raw_user_meta_data->>'deleted')::boolean = true
  ) THEN
    RAISE EXCEPTION 'User account has been deleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent deleted users from getting new sessions
DROP TRIGGER IF EXISTS prevent_deleted_user_login ON auth.sessions;
CREATE TRIGGER prevent_deleted_user_login
  BEFORE INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_user_not_deleted(); 