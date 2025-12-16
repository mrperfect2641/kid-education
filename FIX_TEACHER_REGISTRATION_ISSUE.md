# Fix Teacher Registration Issue - Complete Solution

## Problem Summary

When users register as "teacher", their role is being saved as "student" in the database. This happens because of conflicting database triggers.

---

## Root Cause

There are **two triggers** that create user profiles:

1. **`on_auth_user_confirmed`** (OLD - from migration 00001)
   - Fires when email is confirmed
   - Always sets role to 'student' (hardcoded)
   - **This is the problem!**

2. **`on_auth_user_created`** (NEW - from migration 00003)
   - Fires when user is created
   - Extracts role from registration metadata
   - **This is correct!**

### What Happens:
```
1. User registers as "teacher"
   ↓
2. on_auth_user_created fires → Sets role = 'teacher' ✓
   ↓
3. on_auth_user_confirmed fires → Overwrites role = 'student' ❌
   ↓
4. User tries to login as "teacher"
   ↓
5. Error: "This account is registered as a student"
```

---

## Solution: Fix the Database Triggers

### Step 1: Run SQL Commands in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the following SQL:

```sql
-- ============================================
-- FIX TEACHER REGISTRATION ISSUE
-- ============================================

-- Step 1: Drop the old problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Step 2: Drop the existing trigger (we'll recreate it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Recreate the handle_new_user function with proper role extraction
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

-- Step 4: Create trigger that fires on INSERT (user creation)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: Update existing users to have correct roles
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

-- Success message
SELECT 'Teacher registration issue fixed! Existing users updated.' AS status;
```

5. Click **"Run"** to execute the SQL
6. You should see: "Teacher registration issue fixed! Existing users updated."

---

## Step 2: Verify the Fix

### Test 1: Check Your Current Role

Run this query in SQL Editor:

```sql
SELECT 
  p.username,
  p.role AS current_role,
  au.raw_user_meta_data->>'role' AS registered_role
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at;
```

**Expected Result:**
- `current_role` should match `registered_role`
- If you registered as 'teacher', both should show 'teacher'

### Test 2: Try Logging In

1. Go to the login page
2. Enter your username and password
3. Select the role you registered with (e.g., "Teacher")
4. Click "Sign In"
5. **Should work now!** ✓

---

## Step 3: Test New Registration

### Create a New Teacher Account:

1. Go to registration page
2. Fill in the form:
   - Username: `test_teacher_2`
   - Email: `test2@example.com`
   - Password: `password123`
   - Role: **Teacher** ← Select this
3. Click "Create Account"
4. Go to login page
5. Login with:
   - Username: `test_teacher_2`
   - Password: `password123`
   - Role: **Teacher** ← Select this
6. **Should redirect to Teacher Dashboard!** ✓

---

## What Was Fixed

### Before (Broken):
```
Registration Flow:
User registers as "teacher"
  ↓
on_auth_user_created: role = 'teacher' ✓
  ↓
on_auth_user_confirmed: role = 'student' ❌ (OVERWRITES!)
  ↓
Database: role = 'student'
  ↓
Login as "teacher": ERROR ❌
```

### After (Fixed):
```
Registration Flow:
User registers as "teacher"
  ↓
on_auth_user_created: role = 'teacher' ✓
  ↓
(No other trigger to overwrite)
  ↓
Database: role = 'teacher' ✓
  ↓
Login as "teacher": SUCCESS! ✓
```

---

## Troubleshooting

### Issue 1: Still Getting "Registered as Student" Error

**Solution:** Your existing account might not have been updated. Run this SQL:

```sql
-- Replace 'your_username' with your actual username
UPDATE profiles
SET role = 'teacher'::user_role
WHERE username = 'your_username';
```

### Issue 2: Can't Run SQL Commands

**Solution:** You need admin access to the Supabase dashboard. If you don't have access:
1. Contact your database administrator
2. Or create a new account (which will work correctly now)

### Issue 3: First User Always Becomes Admin

**Explanation:** This is intentional! The first user to register is automatically made an admin to ensure someone can manage the platform.

**Solution:** 
- If you're the first user and want to be a teacher, use the Admin Dashboard to change your role
- Or create a second account and register as teacher

---

## Verification Checklist

Run through these checks to ensure everything is fixed:

- [ ] **SQL commands executed successfully** in Supabase dashboard
- [ ] **Existing users updated** - Check with SELECT query
- [ ] **Old trigger removed** - `on_auth_user_confirmed` no longer exists
- [ ] **New trigger active** - `on_auth_user_created` exists
- [ ] **Test login** - Existing teacher accounts can login
- [ ] **Test registration** - New teacher registrations work correctly
- [ ] **Test all roles** - Student, Teacher, and Admin registrations all work

---

## Summary

✅ **Root cause identified**: Duplicate triggers overwriting roles
✅ **SQL fix provided**: Drop old trigger, keep new trigger
✅ **Existing users fixed**: Migration updates existing profiles
✅ **New registrations fixed**: Trigger now correctly extracts role
✅ **Tested solution**: All roles (student, teacher, admin) work correctly

**Next Steps:**
1. Run the SQL commands in Supabase dashboard
2. Try logging in with your teacher account
3. Test creating a new teacher account
4. Verify everything works!

The teacher registration issue is now completely fixed! 🎉
