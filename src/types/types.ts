export type UserRole = 'student' | 'teacher' | 'admin';
export type EcoActionStatus = 'pending' | 'approved' | 'rejected';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  icon: string | null;
  order_index: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  topic_id: string | null;
  title: string;
  description: string | null;
  points_reward: number;
  time_limit_minutes: number | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_questions: number;
  points_earned: number;
  answers: Record<string, string> | null;
  completed_at: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  difficulty: string;
  points_reward: number;
  instructions: string | null;
  config: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  student_id: string;
  completed: boolean;
  score: number | null;
  points_earned: number;
  attempts: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria_type: string;
  criteria_value: number;
  points_required: number | null;
  rarity: BadgeRarity;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface EcoAction {
  id: string;
  student_id: string;
  title: string;
  description: string;
  action_type: string;
  image_url: string | null;
  status: EcoActionStatus;
  points_reward: number;
  reviewed_by: string | null;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  role: UserRole;
  badge_count: number;
  rank: number;
}

export interface QuizWithQuestions extends Quiz {
  questions?: QuizQuestion[];
  topic?: Topic;
}

export interface ChallengeWithProgress extends Challenge {
  progress?: ChallengeProgress;
}

export interface BadgeWithDetails extends Badge {
  earned?: boolean;
  earned_at?: string;
}

export interface EcoActionWithDetails extends EcoAction {
  student?: Profile;
  reviewer?: Profile;
}

export interface ProfileWithStats extends Profile {
  quiz_count?: number;
  challenge_count?: number;
  eco_action_count?: number;
  badge_count?: number;
  rank?: number;
}
