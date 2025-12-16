/*
# Fix User Role Registration

## Overview
This migration fixes the `handle_new_user()` function to properly read and save the user's
selected role from registration metadata instead of hardcoding it.

## Problem
The current function ignores the role selected during registration and instead:
- Assigns 'admin' to the first user
- Assigns 'student' to all subsequent users

This causes the error: "This account is registered as a student. Please select 'student' to login."
even when users register as admin or teacher.

## Solution
Update the function to:
1. Read the role from user metadata (raw_user_meta_data->>'role')
2. Use the selected role if provided
3. Fall back to 'student' as default if no role is specified
4. Also read username and full_name from metadata

## Changes
- Drop and recreate the `handle_new_user()` function
- Extract role, username, and full_name from user metadata
- Maintain backward compatibility with default 'student' role
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  extracted_username text;
  extracted_role text;
  extracted_full_name text;
BEGIN
  -- Extract username from metadata or email
  extracted_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    REPLACE(NEW.email, '@miaoda.com', '')
  );
  
  -- Extract role from metadata, default to 'student'
  extracted_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'student'
  );
  
  -- Extract full_name from metadata
  extracted_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Insert profile with extracted data
  INSERT INTO profiles (id, username, role, full_name)
  VALUES (
    NEW.id,
    extracted_username,
    extracted_role::user_role,
    extracted_full_name
  );
  
  RETURN NEW;
END;
$$;
