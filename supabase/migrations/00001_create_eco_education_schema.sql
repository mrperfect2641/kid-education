/*
# Gamified Environmental Education Platform - Database Schema

## 1. Overview
This migration creates the complete database structure for the environmental education platform with gamification elements.

## 2. New Tables

### 2.1 profiles
User profiles with role-based access control
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `full_name` (text)
- `role` (user_role enum: student/teacher/admin)
- `avatar_url` (text)
- `total_points` (integer, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.2 topics
Environmental education topics/lessons
- `id` (uuid, primary key)
- `title` (text, not null)
- `description` (text)
- `content` (text)
- `icon` (text)
- `order_index` (integer)
- `created_by` (uuid, references profiles)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.3 quizzes
Quiz definitions
- `id` (uuid, primary key)
- `topic_id` (uuid, references topics)
- `title` (text, not null)
- `description` (text)
- `points_reward` (integer, default 10)
- `time_limit_minutes` (integer)
- `created_by` (uuid, references profiles)
- `is_active` (boolean, default true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.4 quiz_questions
Individual quiz questions
- `id` (uuid, primary key)
- `quiz_id` (uuid, references quizzes)
- `question_text` (text, not null)
- `question_type` (text, default 'multiple_choice')
- `options` (jsonb, array of options)
- `correct_answer` (text, not null)
- `points` (integer, default 1)
- `order_index` (integer)
- `created_at` (timestamptz)

### 2.5 quiz_attempts
Student quiz attempts and results
- `id` (uuid, primary key)
- `quiz_id` (uuid, references quizzes)
- `student_id` (uuid, references profiles)
- `score` (integer, not null)
- `total_questions` (integer, not null)
- `points_earned` (integer, default 0)
- `answers` (jsonb)
- `completed_at` (timestamptz)
- `created_at` (timestamptz)

### 2.6 challenges
Interactive games and challenges
- `id` (uuid, primary key)
- `title` (text, not null)
- `description` (text)
- `challenge_type` (text, not null)
- `difficulty` (text, default 'medium')
- `points_reward` (integer, default 20)
- `instructions` (text)
- `config` (jsonb)
- `is_active` (boolean, default true)
- `created_at` (timestamptz)

### 2.7 challenge_progress
Student progress on challenges
- `id` (uuid, primary key)
- `challenge_id` (uuid, references challenges)
- `student_id` (uuid, references profiles)
- `completed` (boolean, default false)
- `score` (integer)
- `points_earned` (integer, default 0)
- `attempts` (integer, default 0)
- `completed_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.8 badges
Achievement badges
- `id` (uuid, primary key)
- `name` (text, not null, unique)
- `description` (text)
- `icon` (text)
- `criteria_type` (text, not null)
- `criteria_value` (integer, not null)
- `points_required` (integer)
- `rarity` (text, default 'common')
- `created_at` (timestamptz)

### 2.9 user_badges
Badges earned by users
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `badge_id` (uuid, references badges)
- `earned_at` (timestamptz)
- Unique constraint on (user_id, badge_id)

### 2.10 eco_actions
Real-life environmental activities submitted by students
- `id` (uuid, primary key)
- `student_id` (uuid, references profiles)
- `title` (text, not null)
- `description` (text, not null)
- `action_type` (text, not null)
- `image_url` (text)
- `status` (text, default 'pending')
- `points_reward` (integer, default 15)
- `reviewed_by` (uuid, references profiles)
- `review_notes` (text)
- `submitted_at` (timestamptz)
- `reviewed_at` (timestamptz)

## 3. Storage Buckets
- `app-86rk82r38p35_eco_actions` - For eco-action images (max 1MB)

## 4. Security
- Enable RLS on all tables
- Public read access for topics, quizzes, challenges, badges
- Students can view own data and submit content
- Teachers can manage quizzes and approve eco-actions
- Admins have full access to all data
- Helper functions for role checking

## 5. Views
- `leaderboard` - Top students ranked by points

## 6. Functions
- `is_admin()` - Check if user is admin
- `is_teacher_or_admin()` - Check if user is teacher or admin
- `handle_new_user()` - Auto-sync confirmed users to profiles
- `update_user_points()` - Update total points after earning
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Create status enums
CREATE TYPE eco_action_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  avatar_url text,
  total_points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  icon text,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  points_reward integer DEFAULT 10 NOT NULL,
  time_limit_minutes integer,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  points integer DEFAULT 1 NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  points_earned integer DEFAULT 0 NOT NULL,
  answers jsonb,
  completed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  difficulty text DEFAULT 'medium',
  points_reward integer DEFAULT 20 NOT NULL,
  instructions text,
  config jsonb,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Challenge progress table
CREATE TABLE IF NOT EXISTS challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  score integer,
  points_earned integer DEFAULT 0 NOT NULL,
  attempts integer DEFAULT 0 NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(challenge_id, student_id)
);

-- 8. Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL,
  points_required integer,
  rarity badge_rarity DEFAULT 'common'::badge_rarity NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 9. User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- 10. Eco actions table
CREATE TABLE IF NOT EXISTS eco_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  action_type text NOT NULL,
  image_url text,
  status eco_action_status DEFAULT 'pending'::eco_action_status NOT NULL,
  points_reward integer DEFAULT 15 NOT NULL,
  reviewed_by uuid REFERENCES profiles(id),
  review_notes text,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  reviewed_at timestamptz
);

-- Create storage bucket for eco-action images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-86rk82r38p35_eco_actions',
  'app-86rk82r38p35_eco_actions',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for eco-action images
CREATE POLICY "Public read access for eco-action images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-86rk82r38p35_eco_actions');

CREATE POLICY "Authenticated users can upload eco-action images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-86rk82r38p35_eco_actions');

CREATE POLICY "Users can update own eco-action images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-86rk82r38p35_eco_actions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own eco-action images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-86rk82r38p35_eco_actions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

CREATE OR REPLACE FUNCTION is_teacher_or_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role IN ('teacher'::user_role, 'admin'::user_role)
  );
$$;

-- Trigger function to auto-sync confirmed users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    extracted_username,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'student'::user_role END
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-sync users
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'quiz_attempts' THEN
    UPDATE profiles
    SET total_points = total_points + NEW.points_earned,
        updated_at = now()
    WHERE id = NEW.student_id;
  ELSIF TG_TABLE_NAME = 'challenge_progress' THEN
    IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
      UPDATE profiles
      SET total_points = total_points + NEW.points_earned,
          updated_at = now()
      WHERE id = NEW.student_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'eco_actions' THEN
    IF NEW.status = 'approved'::eco_action_status AND OLD.status != 'approved'::eco_action_status THEN
      UPDATE profiles
      SET total_points = total_points + NEW.points_reward,
          updated_at = now()
      WHERE id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers to update points
CREATE TRIGGER update_points_on_quiz_attempt
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

CREATE TRIGGER update_points_on_challenge_complete
  AFTER INSERT OR UPDATE ON challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

CREATE TRIGGER update_points_on_eco_action_approval
  AFTER UPDATE ON eco_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.total_points,
  p.role,
  COUNT(DISTINCT ub.badge_id) as badge_count,
  ROW_NUMBER() OVER (ORDER BY p.total_points DESC, p.created_at ASC) as rank
FROM profiles p
LEFT JOIN user_badges ub ON p.id = ub.user_id
WHERE p.role = 'student'::user_role
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.total_points, p.role, p.created_at;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_actions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Topics policies
CREATE POLICY "Topics are viewable by everyone"
ON topics FOR SELECT
USING (true);

CREATE POLICY "Teachers and admins can create topics"
ON topics FOR INSERT
TO authenticated
WITH CHECK (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Teachers and admins can update topics"
ON topics FOR UPDATE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Admins can delete topics"
ON topics FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Quizzes policies
CREATE POLICY "Active quizzes are viewable by everyone"
ON quizzes FOR SELECT
USING (is_active = true OR is_teacher_or_admin(auth.uid()));

CREATE POLICY "Teachers and admins can create quizzes"
ON quizzes FOR INSERT
TO authenticated
WITH CHECK (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Teachers and admins can update quizzes"
ON quizzes FOR UPDATE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Admins can delete quizzes"
ON quizzes FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Quiz questions policies
CREATE POLICY "Quiz questions are viewable by everyone"
ON quiz_questions FOR SELECT
USING (true);

CREATE POLICY "Teachers and admins can create quiz questions"
ON quiz_questions FOR INSERT
TO authenticated
WITH CHECK (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Teachers and admins can update quiz questions"
ON quiz_questions FOR UPDATE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Teachers and admins can delete quiz questions"
ON quiz_questions FOR DELETE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts"
ON quiz_attempts FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR is_teacher_or_admin(auth.uid()));

CREATE POLICY "Students can create quiz attempts"
ON quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Challenges policies
CREATE POLICY "Active challenges are viewable by everyone"
ON challenges FOR SELECT
USING (is_active = true OR is_teacher_or_admin(auth.uid()));

CREATE POLICY "Admins can create challenges"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update challenges"
ON challenges FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete challenges"
ON challenges FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Challenge progress policies
CREATE POLICY "Users can view own challenge progress"
ON challenge_progress FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR is_teacher_or_admin(auth.uid()));

CREATE POLICY "Students can create challenge progress"
ON challenge_progress FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own challenge progress"
ON challenge_progress FOR UPDATE
TO authenticated
USING (student_id = auth.uid());

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
ON badges FOR SELECT
USING (true);

CREATE POLICY "Admins can create badges"
ON badges FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update badges"
ON badges FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete badges"
ON badges FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
ON user_badges FOR SELECT
USING (true);

CREATE POLICY "System can award badges"
ON user_badges FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Eco actions policies
CREATE POLICY "Users can view own eco actions"
ON eco_actions FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR is_teacher_or_admin(auth.uid()));

CREATE POLICY "Students can create eco actions"
ON eco_actions FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own pending eco actions"
ON eco_actions FOR UPDATE
TO authenticated
USING (student_id = auth.uid() AND status = 'pending'::eco_action_status);

CREATE POLICY "Teachers and admins can review eco actions"
ON eco_actions FOR UPDATE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));

CREATE POLICY "Admins can delete eco actions"
ON eco_actions FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Insert initial badges
INSERT INTO badges (name, description, icon, criteria_type, criteria_value, points_required, rarity) VALUES
('Green Starter', 'Complete your first quiz', '🌱', 'quiz_count', 1, 10, 'common'::badge_rarity),
('Eco Warrior', 'Earn 100 eco-points', '⚡', 'total_points', 100, 100, 'rare'::badge_rarity),
('Quiz Master', 'Complete 10 quizzes', '🎓', 'quiz_count', 10, 100, 'rare'::badge_rarity),
('Challenge Champion', 'Complete 5 challenges', '🏆', 'challenge_count', 5, 100, 'epic'::badge_rarity),
('Green Hero', 'Earn 500 eco-points', '🌟', 'total_points', 500, 500, 'epic'::badge_rarity),
('Eco Star', 'Earn 1000 eco-points', '⭐', 'total_points', 1000, 1000, 'legendary'::badge_rarity),
('Action Taker', 'Submit 5 real-life eco-actions', '🌍', 'eco_action_count', 5, 75, 'rare'::badge_rarity),
('Planet Protector', 'Submit 20 real-life eco-actions', '🛡️', 'eco_action_count', 20, 300, 'legendary'::badge_rarity);

-- Insert initial topics
INSERT INTO topics (title, description, content, icon, order_index) VALUES
('Climate Change', 'Learn about global warming and its impacts on our planet', 'Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas.', '🌡️', 1),
('Pollution', 'Understanding different types of pollution and their effects', 'Pollution is the introduction of harmful materials into the environment. These harmful materials are called pollutants. Pollutants can be natural, such as volcanic ash, or created by human activity, such as trash or runoff from factories.', '🏭', 2),
('Recycling & Waste Management', 'Learn how to reduce, reuse, and recycle effectively', 'Recycling is the process of converting waste materials into new materials and objects. It is an alternative to conventional waste disposal that can save material and help lower greenhouse gas emissions.', '♻️', 3),
('Renewable Energy', 'Explore clean energy sources for a sustainable future', 'Renewable energy is energy from sources that are naturally replenishing but flow-limited. They are virtually inexhaustible in duration but limited in the amount of energy that is available per unit of time. The major types include solar, wind, hydro, and geothermal.', '☀️', 4),
('Biodiversity', 'Discover the importance of protecting diverse ecosystems', 'Biodiversity is all the different kinds of life you will find in one area—the variety of animals, plants, fungi, and even microorganisms like bacteria that make up our natural world. Each of these species and organisms work together in ecosystems to maintain balance.', '🦋', 5);

-- Insert initial challenges
INSERT INTO challenges (title, description, challenge_type, difficulty, points_reward, instructions, config, is_active) VALUES
('Sort the Waste', 'Help sort different items into the correct recycling bins', 'sorting', 'easy', 20, 'Drag and drop items into the correct bins: Recyclable, Compost, or Trash', '{"items": ["plastic_bottle", "banana_peel", "newspaper", "glass_jar", "food_wrapper", "apple_core", "cardboard_box", "battery"], "bins": ["recyclable", "compost", "trash"], "correct_answers": {"plastic_bottle": "recyclable", "banana_peel": "compost", "newspaper": "recyclable", "glass_jar": "recyclable", "food_wrapper": "trash", "apple_core": "compost", "cardboard_box": "recyclable", "battery": "trash"}}', true),
('Save the Trees', 'Plant virtual trees by answering quick environmental questions', 'quiz', 'medium', 25, 'Answer questions correctly to plant trees and grow your forest', '{"questions": 5, "time_per_question": 15, "trees_per_correct": 1}', true),
('Clean the Ocean', 'Remove pollution from the ocean by identifying harmful items', 'cleanup', 'medium', 30, 'Click on pollutants to remove them from the ocean. Avoid clicking on marine life!', '{"duration_seconds": 60, "pollutants": ["plastic_bag", "bottle", "can", "straw", "wrapper"], "marine_life": ["fish", "turtle", "dolphin", "coral"], "target_score": 20}', true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_challenge_progress_student_id ON challenge_progress(student_id);
CREATE INDEX idx_challenge_progress_challenge_id ON challenge_progress(challenge_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_eco_actions_student_id ON eco_actions(student_id);
CREATE INDEX idx_eco_actions_status ON eco_actions(status);
