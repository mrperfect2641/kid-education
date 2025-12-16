/*
# Update Existing User Roles from Metadata

## Problem:
Existing users who registered as 'teacher' or 'admin' might have their role incorrectly set to 'student'
due to the old trigger overwriting their roles.

## Solution:
Update existing profiles to match the role stored in their auth.users metadata.

## Changes:
- Read role from auth.users.raw_user_meta_data
- Update profiles.role to match the metadata
- Only update if metadata role exists and is different from current role
*/

-- Update existing user roles from their registration metadata
UPDATE profiles p
SET 
  role = (
    SELECT COALESCE(
      (au.raw_user_meta_data->>'role')::user_role,
      p.role
    )
    FROM auth.users au
    WHERE au.id = p.id
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 
  FROM auth.users au
  WHERE au.id = p.id
  AND (au.raw_user_meta_data->>'role')::user_role IS NOT NULL
  AND (au.raw_user_meta_data->>'role')::user_role != p.role
);

-- Log the update
DO $$
DECLARE
  updated_count int;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % user roles from metadata', updated_count;
END $$;
