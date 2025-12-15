/*
# Fix User Role Registration

This migration updates the handle_new_user() function to properly use the role
from user metadata during registration, and also stores the full_name (email).

## Changes:
1. Update handle_new_user() function to:
   - Extract role from raw_user_meta_data
   - Extract full_name (email) from raw_user_meta_data
   - Use extracted role instead of defaulting to 'student'
   - First user is still automatically admin
*/

-- Drop existing function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with role extraction from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
  user_role user_role;
  user_full_name text;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  -- Extract role from user metadata (default to 'student' if not provided)
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'student'::user_role
  );
  
  -- Extract full_name (email) from user metadata
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- First user is always admin, otherwise use the role from metadata
  IF user_count = 0 THEN
    user_role := 'admin'::user_role;
  END IF;
  
  -- Insert profile with extracted data
  INSERT INTO profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    extracted_username,
    user_full_name,
    user_role
  );
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
