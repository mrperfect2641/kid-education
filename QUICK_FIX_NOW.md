# QUICK FIX - Run This SQL Now!

## Problem
You're getting: "This account is registered as a student. Please select 'student' to login."

## Solution - Run This SQL in Supabase Dashboard

### Step 1: Open Supabase SQL Editor

1. Go to: https://adulltdpxmyrqgnlovrk.supabase.co
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Copy and Paste This SQL

```sql
-- QUICK FIX: Update your account to teacher role
-- Replace 'your_username' with your actual username

UPDATE profiles
SET role = 'teacher'::user_role, updated_at = now()
WHERE username = 'your_username';

-- Verify the change
SELECT username, role FROM profiles WHERE username = 'your_username';
```

### Step 3: Modify the SQL

**IMPORTANT:** Replace `'your_username'` with your actual username (the one you used to register)

Example:
```sql
-- If your username is "john_teacher"
UPDATE profiles
SET role = 'teacher'::user_role, updated_at = now()
WHERE username = 'john_teacher';

SELECT username, role FROM profiles WHERE username = 'john_teacher';
```

### Step 4: Click "Run"

You should see:
```
| username      | role    |
|---------------|---------|
| your_username | teacher |
```

### Step 5: Try Logging In Again

1. Go to login page
2. Username: your_username
3. Password: your_password
4. Role: **Teacher**
5. Click "Sign In"
6. **Should work now!** ✓

---

## If You Don't Know Your Username

Run this SQL to see all users:

```sql
SELECT username, role, email, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

Find your username in the list, then use it in the UPDATE query above.

---

## Fix for Future Registrations

After fixing your account, run this SQL to prevent the issue for new users:

```sql
-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Drop and recreate the correct trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
  SELECT COUNT(*) INTO user_count FROM profiles;
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'student'::user_role
  );
  
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  user_email := NEW.raw_user_meta_data->>'email';
  
  IF user_count = 0 THEN
    user_role := 'admin'::user_role;
  END IF;
  
  INSERT INTO profiles (id, username, email, full_name, role)
  VALUES (NEW.id, extracted_username, user_email, user_full_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Summary

**Immediate Fix (Do This First):**
1. Run the UPDATE query with your username
2. Try logging in as teacher
3. Should work immediately!

**Permanent Fix (Do This Second):**
1. Run the trigger fix SQL
2. New teacher registrations will work correctly

**Total Time:** 2 minutes ⏱️

---

## Still Not Working?

If you still get the error after running the UPDATE query:

1. **Check if you're the first user** - First user is always admin
   - Try logging in as **Admin** instead of Teacher
   
2. **Check your actual role** - Run this SQL:
   ```sql
   SELECT username, role FROM profiles;
   ```

3. **Clear browser cache** - Logout and clear cookies, then try again

4. **Create a new account** - After running the trigger fix, create a new teacher account

---

## Need Help?

If you're still stuck, tell me:
1. What username did you use to register?
2. What does this query return?
   ```sql
   SELECT username, role FROM profiles;
   ```
3. Are you the first user in the system?

I'll help you fix it! 🚀
