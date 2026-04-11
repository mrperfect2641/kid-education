import { supabase } from './supabase';
import type {
  Profile,
  Topic,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Challenge,
  ChallengeProgress,
  Badge,
  UserBadge,
  EcoAction,
  LeaderboardEntry,
  QuizWithQuestions,
  EcoActionWithDetails,
} from '@/types/types';

const PAGE_SIZE = 20;

export const profilesApi = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },

  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Profile;
  },

  async getAllProfiles(page = 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as Profile[] : [];
  },

  async deleteProfile(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const topicsApi = {
  async getAllTopics() {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data as Topic[] : [];
  },

  async getTopic(id: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Topic | null;
  },

  async createTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Topic;
  },

  async updateTopic(id: string, updates: Partial<Topic>) {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Topic;
  },

  async deleteTopic(id: string) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const quizzesApi = {
  async getAllQuizzes(page = 0) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, topic:topics(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as QuizWithQuestions[] : [];
  },

  async getQuiz(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, topic:topics(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as QuizWithQuestions | null;
  },

  async getQuizWithQuestions(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, questions:quiz_questions(*), topic:topics(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as QuizWithQuestions | null;
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Quiz;
  },

  async updateQuiz(id: string, updates: Partial<Quiz>) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Quiz;
  },

  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const quizQuestionsApi = {
  async getQuestionsByQuizId(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data as QuizQuestion[] : [];
  },

  async createQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(question)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as QuizQuestion;
  },

  async updateQuestion(id: string, updates: Partial<QuizQuestion>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as QuizQuestion;
  },

  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const quizAttemptsApi = {
  async getStudentAttempts(studentId: string, page = 0) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*, quiz:quizzes(*)')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getQuizAttempts(quizId: string, page = 0) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*, student:profiles(*)')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllAttempts(page = 0) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*, student:profiles(*), quiz:quizzes(*)')
      .order('completed_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as QuizAttempt;
  },
};

export const challengesApi = {
  async getAllChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data as Challenge[] : [];
  },

  async getChallenge(id: string) {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Challenge | null;
  },

  async createChallenge(challenge: Omit<Challenge, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Challenge;
  },

  async updateChallenge(id: string, updates: Partial<Challenge>) {
    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Challenge;
  },
};

export const challengeProgressApi = {
  async getStudentProgress(studentId: string) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*, challenge:challenges(*)')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getChallengeProgress(challengeId: string, studentId: string) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data as ChallengeProgress | null;
  },

  async getAllProgress(page = 0) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*, student:profiles(*), challenge:challenges(*)')
      .order('updated_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createOrUpdateProgress(progress: Omit<ChallengeProgress, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .upsert(progress, { onConflict: 'challenge_id,student_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as ChallengeProgress;
  },
};

export const badgesApi = {
  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data as Badge[] : [];
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async awardBadge(userId: string, badgeId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as UserBadge;
  },
};

export const ecoActionsApi = {
  async getStudentActions(studentId: string, page = 0) {
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as EcoAction[] : [];
  },

  async getPendingActions(page = 0) {
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*, student:profiles!eco_actions_student_id_fkey(*)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as EcoActionWithDetails[] : [];
  },

  async getAllActions(page = 0) {
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*, student:profiles!eco_actions_student_id_fkey(*), reviewer:profiles!eco_actions_reviewed_by_fkey(*)')
      .order('submitted_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as EcoActionWithDetails[] : [];
  },

  async createAction(action: Omit<EcoAction, 'id' | 'submitted_at' | 'reviewed_at' | 'status'>) {
    const { data, error } = await supabase
      .from('eco_actions')
      .insert(action)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as EcoAction;
  },

  async updateAction(id: string, updates: Partial<EcoAction>) {
    const { data, error } = await supabase
      .from('eco_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as EcoAction;
  },

  async reviewAction(id: string, status: 'approved' | 'rejected', reviewedBy: string, reviewNotes?: string) {
    const { data, error } = await supabase
      .from('eco_actions')
      .update({
        status,
        reviewed_by: reviewedBy,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as EcoAction;
  },
};

export const leaderboardApi = {
  async getLeaderboard(page = 0) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    return Array.isArray(data) ? data as LeaderboardEntry[] : [];
  },

  async getUserRank(userId: string) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as LeaderboardEntry | null;
  },
};

export const storageApi = {
  async uploadEcoActionImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('app-86rk82r38p35_eco_actions')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('app-86rk82r38p35_eco_actions')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteEcoActionImage(url: string) {
    const path = url.split('/').slice(-2).join('/');

    const { error } = await supabase.storage
      .from('app-86rk82r38p35_eco_actions')
      .remove([path]);

    if (error) throw error;
  },
};
