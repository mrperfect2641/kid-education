# How to Check Your User Role in the Database

## The Problem

You registered as a teacher but the system says you're registered as a student. This could be caused by:

1. **First User Auto-Admin**: If you were the first user to register, you were automatically made an admin (not a teacher)
2. **Migration Not Applied**: The database migration that extracts roles might not have been applied
3. **Metadata Not Saved**: The role metadata might not have been saved during registration

---

## Solution 1: Check Your Actual Role in Database

### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Click on "Table Editor" in the left sidebar
3. Select the `profiles` table
4. Find your username in the list
5. Check the `role` column - it will show your actual role

### Expected Result:
```
| id (uuid) | username | role | total_points |
|-----------|----------|------|--------------|
| xxx-xxx   | your_username | teacher | 0 |
```

---

## Solution 2: Fix Your Role (If Incorrect)

### Option A: Use Admin Dashboard (If you're the first user)

If you were the first user, you're actually an admin! You can:

1. Login as **Admin** (not teacher)
2. Go to Admin Dashboard
3. Find your user in the user list
4. Change your role to "teacher" if needed

### Option B: Create a New Account

1. Register a new account
2. Select "Teacher" as the role
3. Make sure you're NOT the first user (so you won't be auto-admin)
4. Login with the new account as "Teacher"

### Option C: Manually Update Database (Advanced)

If you have direct database access:

```sql
-- Check current role
SELECT username, role FROM profiles WHERE username = 'your_username';

-- Update role to teacher
UPDATE profiles 
SET role = 'teacher'::user_role 
WHERE username = 'your_username';
```

---

## Solution 3: Verify Migration Was Applied

Check if the migration file exists and was applied:

### File Location:
```
supabase/migrations/00003_fix_user_role_registration.sql
```

### What It Does:
- Extracts role from registration metadata
- Stores role in profiles table
- First user is always admin (by design)
- Subsequent users get their selected role

---

## Understanding the First User Auto-Admin Feature

### Why Does This Exist?

The system automatically makes the **first user** an admin to ensure:
- Someone has admin access to manage the platform
- The platform can be set up and configured
- Users and roles can be managed

### The Logic:

```sql
-- First user is always admin
IF user_count = 0 THEN
  user_role := 'admin'::user_role;
END IF;
```

### What This Means:

| Registration Order | Selected Role | Actual Role | Reason |
|-------------------|---------------|-------------|---------|
| 1st user | Student | **Admin** | Auto-admin for first user |
| 1st user | Teacher | **Admin** | Auto-admin for first user |
| 1st user | Admin | **Admin** | Auto-admin for first user |
| 2nd+ user | Student | **Student** | Uses selected role |
| 2nd+ user | Teacher | **Teacher** | Uses selected role |
| 2nd+ user | Admin | **Admin** | Uses selected role |

---

## Testing Steps

### Step 1: Verify Your Current Role

1. Try logging in as **Admin** (not teacher)
   - Username: your_username
   - Password: your_password
   - Role: **Admin** ← Select this
   
2. If successful, you're actually an admin!

### Step 2: Check If You're the First User

If you can login as admin, you were the first user and were auto-promoted to admin.

### Step 3: Create a Test Teacher Account

1. Register a new account:
   - Username: test_teacher
   - Email: test@example.com
   - Password: password123
   - Role: **Teacher** ← Select this

2. Login with the new account:
   - Username: test_teacher
   - Password: password123
   - Role: **Teacher** ← Select this

3. Should redirect to Teacher Dashboard (/teacher)

---

## Quick Diagnostic Checklist

Run through these checks:

- [ ] **Check 1**: Try logging in as Admin instead of Teacher
  - If successful → You're the first user (auto-admin)
  
- [ ] **Check 2**: Check the profiles table in Supabase
  - Look at the `role` column for your username
  
- [ ] **Check 3**: Count how many users exist
  - If you're the only user → You're auto-admin
  
- [ ] **Check 4**: Create a second test account
  - Register as teacher
  - Login as teacher
  - Should work correctly

---

## Expected Behavior

### Correct Flow for Teacher Registration:

```
1. User registers (NOT first user)
   - Username: teacher_john
   - Role: Teacher ✓
   
2. Database trigger fires
   - Extracts role from metadata
   - Stores role = 'teacher'
   
3. User logs in
   - Username: teacher_john
   - Role: Teacher ✓
   
4. System validates
   - Database role: teacher
   - Selected role: teacher
   - Match: ✓ YES
   
5. Redirect to Teacher Dashboard
   - URL: /teacher
   - Success!
```

---

## Summary

**Most Likely Cause**: You were the first user to register, so you were automatically made an admin (not a teacher).

**Solution**: 
1. Try logging in as **Admin** instead of Teacher
2. Or create a new account and select Teacher role
3. Or use Admin Dashboard to change your role to Teacher

**Note**: The "first user auto-admin" feature is intentional and ensures someone has admin access to manage the platform!
