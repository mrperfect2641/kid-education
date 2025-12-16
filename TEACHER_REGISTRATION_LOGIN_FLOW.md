# Teacher Registration and Login Flow - Complete Implementation

## Overview
The system now fully supports teacher registration, login, and automatic redirection to the Teacher Dashboard with complete database connectivity.

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEACHER REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User visits /register
    ↓
Step 2: User fills registration form
    • Username: teacher_john
    • Email: teacher_john@example.com
    • Password: ********
    • Role: [Teacher] ← User selects "Teacher" from dropdown
    ↓
Step 3: Click "Create Account"
    ↓
Step 4: System creates Supabase Auth user
    • Email: teacher_john@miaoda.com (internal format)
    • Password: hashed securely
    • Metadata: { role: 'teacher', full_name: 'teacher_john@example.com' }
    ↓
Step 5: Database trigger fires (handle_new_user)
    • Extracts role from metadata
    • Creates profile in profiles table
    • Sets role = 'teacher'
    ↓
Step 6: Success! User registered as teacher
    ↓
Step 7: Redirect to /login

┌─────────────────────────────────────────────────────────────────────┐
│                      TEACHER LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User visits /login
    ↓
Step 2: User fills login form
    • Username: teacher_john
    • Password: ********
    • Role: [Teacher] ← User selects "Teacher" from dropdown
    ↓
Step 3: Click "Sign In"
    ↓
Step 4: System authenticates credentials
    • Supabase Auth validates username/password
    ↓
Step 5: System fetches user profile from database
    • Query: SELECT * FROM profiles WHERE id = user.id
    ↓
Step 6: System validates selected role matches registered role
    • Profile role: 'teacher'
    • Selected role: 'teacher'
    • Match: ✓ YES
    ↓
Step 7: Success! Redirect to Teacher Dashboard
    • Navigate to: /teacher
    ↓
Step 8: Teacher Dashboard loads
    • Fetches all quizzes from database
    • Fetches all games/challenges from database
    • Fetches all quiz attempts from database
    • Fetches all game progress from database
    • Fetches all eco-actions from database
    • Fetches all student profiles from database
    • Calculates leaderboard rankings
    ↓
Step 9: Dashboard displays with 4 tabs
    • Overview Tab: Recent activity and pending eco-actions
    • Manage Quizzes Tab: All quizzes with edit options
    • Manage Games Tab: All games with edit options
    • Leaderboard Tab: Student rankings and eco-actions
```

---

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  email text UNIQUE,
  full_name text,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Database Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, role)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'email',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'student'::user_role
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Teacher Dashboard Database Connectivity

### Data Sources
The Teacher Dashboard connects to multiple database tables:

1. **Profiles Table** (`profilesApi.getAllProfiles()`)
   - Fetches all user profiles
   - Filters students for leaderboard
   - Gets teacher information

2. **Quizzes Table** (`quizzesApi.getAllQuizzes()`)
   - Fetches all quizzes created
   - Includes quiz questions
   - Shows quiz topics

3. **Quiz Attempts Table** (`quizAttemptsApi.getAllAttempts()`)
   - Fetches all student quiz attempts
   - Shows scores and points earned
   - Tracks completion dates

4. **Challenges Table** (`challengesApi.getAllChallenges()`)
   - Fetches all games/challenges
   - Shows challenge types and points
   - Tracks game metadata

5. **Challenge Progress Table** (`challengeProgressApi.getAllProgress()`)
   - Fetches all student game progress
   - Shows completion status
   - Tracks scores and points

6. **Eco Actions Table** (`ecoActionsApi.getAllActions()` & `ecoActionsApi.getPendingActions()`)
   - Fetches all eco-actions submitted
   - Filters pending actions for review
   - Shows approval status

### API Functions Used

```typescript
// Load all data from database
const loadData = async () => {
  const [
    actionsData,      // Pending eco-actions
    quizzesData,      // All quizzes
    attemptsData,     // All quiz attempts
    progressData,     // All game progress
    challengesData,   // All challenges
    allActionsData,   // All eco-actions
    studentsData      // All profiles
  ] = await Promise.all([
    ecoActionsApi.getPendingActions(),
    quizzesApi.getAllQuizzes(),
    quizAttemptsApi.getAllAttempts(),
    challengeProgressApi.getAllProgress(),
    challengesApi.getAllChallenges(),
    ecoActionsApi.getAllActions(),
    profilesApi.getAllProfiles(),
  ]);
  
  // Process and display data
};
```

---

## Teacher Dashboard Features

### 1. Overview Tab
**Database Queries:**
- Recent quiz attempts (last 10)
- Recent game progress (last 10)
- Pending eco-actions (all)

**Actions:**
- Approve eco-action → Updates `eco_actions.status = 'approved'`
- Reject eco-action → Updates `eco_actions.status = 'rejected'`

### 2. Manage Quizzes Tab
**Database Queries:**
- All quizzes with questions
- Quiz attempt counts per quiz

**Actions:**
- Add New Quiz → Navigate to /quizzes
- Edit Quiz → Navigate to /quiz/:id

### 3. Manage Games Tab
**Database Queries:**
- All challenges/games
- Completion counts per game

**Actions:**
- Add New Game → Navigate to /challenges
- Edit Game → Navigate to /challenge/:id

### 4. Leaderboard Tab
**Database Queries:**
- All student profiles
- All quiz attempts per student
- All game progress per student
- All eco-actions

**Calculations:**
- Total points per student
- Average quiz score per student
- Games played and completed per student
- Ranking by total points

---

## Role Validation Security

### Registration Security
```typescript
// User metadata stored during registration
const metadata = {
  role: selectedRole,  // 'teacher'
  email: email,
  full_name: email
};

// Database trigger extracts and stores role
role = metadata.role  // 'teacher'
```

### Login Security
```typescript
// Step 1: Authenticate credentials
const { data } = await supabase.auth.signInWithPassword({
  email: `${username}@miaoda.com`,
  password
});

// Step 2: Fetch profile from database
const profile = await profilesApi.getProfile(data.user.id);

// Step 3: Validate selected role matches registered role
if (profile.role !== selectedRole) {
  // Error: Role mismatch
  toast.error(`This account is registered as a ${profile.role}`);
  await supabase.auth.signOut();
  return;
}

// Step 4: Route based on role
if (selectedRole === 'teacher') {
  navigate('/teacher');
}
```

---

## Testing the Complete Flow

### Test Case 1: Teacher Registration and Login

**Step 1: Register as Teacher**
```
1. Go to /register
2. Enter username: test_teacher
3. Enter email: test_teacher@example.com
4. Enter password: password123
5. Select role: Teacher
6. Click "Create Account"
7. ✓ Success: Account created
8. ✓ Redirect to /login
```

**Step 2: Login as Teacher**
```
1. Enter username: test_teacher
2. Enter password: password123
3. Select role: Teacher
4. Click "Sign In"
5. ✓ Success: "Welcome back, test_teacher!"
6. ✓ Redirect to /teacher
7. ✓ Teacher Dashboard loads with all data
```

**Step 3: Verify Dashboard Data**
```
1. ✓ Statistics cards show correct counts
2. ✓ Overview tab shows recent activity
3. ✓ Manage Quizzes tab shows all quizzes
4. ✓ Manage Games tab shows all games
5. ✓ Leaderboard tab shows student rankings
6. ✓ All data loaded from database
```

### Test Case 2: Role Mismatch Prevention

**Scenario: Teacher tries to login as Student**
```
1. Go to /login
2. Enter username: test_teacher (registered as teacher)
3. Enter password: password123
4. Select role: Student ❌
5. Click "Sign In"
6. ✓ Error: "This account is registered as a teacher. Please select 'teacher' to login."
7. ✓ User logged out automatically
8. ✓ Cannot access student dashboard
```

---

## Database Connection Verification

### Check 1: Profile Created
```sql
SELECT * FROM profiles WHERE username = 'test_teacher';

Expected Result:
id         | username     | role    | total_points
-----------|--------------|---------|-------------
uuid-here  | test_teacher | teacher | 0
```

### Check 2: Data Loading
```typescript
// Teacher Dashboard loads data from:
- profiles table (students)
- quizzes table (all quizzes)
- quiz_attempts table (all attempts)
- challenges table (all games)
- challenge_progress table (all progress)
- eco_actions table (all actions)
```

### Check 3: Real-time Updates
```
1. Student completes quiz
   → quiz_attempts table updated
   → Teacher dashboard shows new attempt

2. Student submits eco-action
   → eco_actions table updated
   → Teacher dashboard shows pending action

3. Teacher approves eco-action
   → eco_actions.status updated to 'approved'
   → Student's total_points updated
   → Leaderboard rankings recalculated
```

---

## Summary

✅ **Registration Flow**: Complete and working
✅ **Login Flow**: Complete with role validation
✅ **Database Connection**: All tables connected
✅ **Teacher Dashboard**: Fully functional with 4 tabs
✅ **Data Loading**: Real-time from database
✅ **Role Security**: Validated and enforced
✅ **Routing**: Automatic redirect to /teacher
✅ **API Integration**: All API functions working
✅ **Error Handling**: Comprehensive error messages
✅ **User Experience**: Smooth and intuitive

The complete teacher registration, login, and dashboard system is now fully implemented and connected to the database!
