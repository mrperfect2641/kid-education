/*
# Fix Duplicate User Registration Triggers

## Problem:
Two triggers exist that create profiles:
1. on_auth_user_confirmed (fires on email confirmation) - always sets role to 'student'
2. on_auth_user_created (fires on user creation) - extracts role from metadata

This causes the role to be overwritten to 'student' even when user registers as 'teacher'.

## Solution:
1. Drop the old on_auth_user_confirmed trigger
2. Keep only on_auth_user_created trigger (which properly extracts role from metadata)
3. Ensure the trigger fires on INSERT (user creation) not UPDATE (email confirmation)

## Changes:
- DROP old trigger: on_auth_user_confirmed
- KEEP new trigger: on_auth_user_created
- Ensure handle_new_user() properly extracts role from metadata
*/

-- Drop the old trigger that overwrites roles
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Ensure the correct trigger exists (on INSERT, not UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with proper role extraction
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
  user_email text;
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
  
  -- Extract email from user metadata (for display purposes)
  user_email := NEW.raw_user_meta_data->>'email';
  
  -- First user is always admin, otherwise use the role from metadata
  IF user_count = 0 THEN
    user_role := 'admin'::user_role;
  END IF;
  
  -- Insert profile with extracted data
  -- Use ON CONFLICT to prevent duplicate inserts
  INSERT INTO profiles (id, username, email, full_name, role)
  VALUES (
    NEW.id,
    extracted_username,
    user_email,
    user_full_name,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires on INSERT (user creation)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Automatically creates a profile when a new user signs up, extracting role from registration metadata';
