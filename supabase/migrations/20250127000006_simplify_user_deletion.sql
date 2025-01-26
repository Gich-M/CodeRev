-- Drop previous functions and triggers with proper cascade
DROP TRIGGER IF EXISTS prevent_deleted_user_login ON auth.sessions;
DROP FUNCTION IF EXISTS delete_user_data(uuid);
DROP FUNCTION IF EXISTS auth.check_user_not_deleted() CASCADE;

-- Create a simpler delete function
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS void AS $$
DECLARE
  _debug text;
BEGIN
  -- Log the start of deletion
  RAISE NOTICE 'Starting deletion for user: %', target_user_id;

  BEGIN
    -- Delete reviews
    DELETE FROM public.reviews WHERE reviewer_id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % reviews', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting reviews: %', SQLERRM;
  END;

  BEGIN
    -- Delete code snippets
    DELETE FROM public.code_snippets WHERE user_id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % code snippets', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting code snippets: %', SQLERRM;
  END;

  BEGIN
    -- Delete user settings
    DELETE FROM public.user_settings WHERE user_id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % user settings', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user settings: %', SQLERRM;
  END;

  BEGIN
    -- Delete user achievements
    DELETE FROM public.user_achievements WHERE user_id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % user achievements', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user achievements: %', SQLERRM;
  END;

  BEGIN
    -- Delete profile
    DELETE FROM public.profiles WHERE id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting profile: %', SQLERRM;
  END;

  BEGIN
    -- Mark user as deleted and update their data
    UPDATE auth.users 
    SET 
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
          'deleted', true,
          'deleted_at', CURRENT_TIMESTAMP::text
        ),
      email = 'deleted_' || encode(gen_random_bytes(8), 'hex') || '@deleted.com',
      encrypted_password = NULL
    WHERE id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Updated % auth users', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating auth user: %', SQLERRM;
  END;

  RAISE NOTICE 'Deletion complete for user: %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.delete_user_data TO authenticated;

-- Create a new function to check for deleted users
CREATE OR REPLACE FUNCTION auth.check_user_deleted()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.user_id 
    AND (raw_user_meta_data->>'deleted')::boolean = true
  ) THEN
    RAISE EXCEPTION 'User account has been deleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for preventing deleted users from logging in
CREATE TRIGGER prevent_deleted_user_login
  BEFORE INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_user_deleted(); 