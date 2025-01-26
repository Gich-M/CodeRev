-- Drop and recreate the delete function with complete deletion
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
    -- Delete from auth.users (this will cascade to sessions and other auth tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS _debug = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', _debug;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting auth user: %', SQLERRM;
    -- If we can't delete, mark as deleted
    UPDATE auth.users 
    SET 
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
          'deleted', true,
          'deleted_at', CURRENT_TIMESTAMP::text
        ),
      email = 'deleted_' || encode(gen_random_bytes(8), 'hex') || '@deleted.com',
      encrypted_password = NULL,
      email_confirmed_at = NULL,
      last_sign_in_at = NULL,
      aud = 'deleted'
    WHERE id = target_user_id;
  END;

  RAISE NOTICE 'Deletion complete for user: %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.delete_user_data TO authenticated; 