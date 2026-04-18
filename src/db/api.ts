import { authStore } from "@/lib/auth";
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
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStore.getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const profilesApi = {
  async getCurrentUser() {
    const user = authStore.getUser();
    if (!user) return null;
    const data = await request<Profile>(`/profiles/${user.id}`);
    return data;
  },

  async getProfile(id: string) {
    return request<Profile | null>(`/profiles/${id}`);
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    return request<Profile>(`/profiles/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async getAllProfiles(page = 0) {
    const data = await request<Profile[]>("/profiles");
    return data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async deleteProfile(id: string) {
    await request<void>(`/profiles/${id}`, { method: "DELETE" });
  },
};

export const topicsApi = {
  async getAllTopics() {
    return request<Topic[]>("/topics");
  },

  async getTopic(id: string) {
    return request<Topic | null>(`/topics/${id}`);
  },

  async createTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
    return request<Topic>("/topics", { method: "POST", body: JSON.stringify(topic) });
  },

  async updateTopic(id: string, updates: Partial<Topic>) {
    return request<Topic>(`/topics/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async deleteTopic(id: string) {
    await request<void>(`/topics/${id}`, { method: "DELETE" });
  },
};

export const quizzesApi = {
  async getAllQuizzes(page = 0) {
    const data = await request<QuizWithQuestions[]>("/quizzes");
    return data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async getQuiz(id: string) {
    return request<QuizWithQuestions | null>(`/quizzes/${id}`);
  },

  async getQuizWithQuestions(id: string) {
    return request<QuizWithQuestions | null>(`/quizzes/${id}`);
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) {
    return request<Quiz>("/quizzes", { method: "POST", body: JSON.stringify(quiz) });
  },

  async updateQuiz(id: string, updates: Partial<Quiz>) {
    return request<Quiz>(`/quizzes/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async deleteQuiz(id: string) {
    await request<void>(`/quizzes/${id}`, { method: "DELETE" });
  },
};

export const quizQuestionsApi = {
  async getQuestionsByQuizId(quizId: string) {
    const data = await request<QuizQuestion[]>("/quiz_questions");
    return data.filter((item) => item.quiz_id === quizId);
  },

  async createQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>) {
    return request<QuizQuestion>("/quiz_questions", { method: "POST", body: JSON.stringify(question) });
  },

  async updateQuestion(id: string, updates: Partial<QuizQuestion>) {
    return request<QuizQuestion>(`/quiz_questions/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async deleteQuestion(id: string) {
    await request<void>(`/quiz_questions/${id}`, { method: "DELETE" });
  },
};

export const quizAttemptsApi = {
  async getStudentAttempts(studentId: string, page = 0) {
    const data = await request<any[]>("/quiz_attempts");
    return data.filter((item) => item.student_id === studentId).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async getQuizAttempts(quizId: string, page = 0) {
    const data = await request<any[]>("/quiz_attempts");
    return data.filter((item) => item.quiz_id === quizId).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async getAllAttempts(page = 0) {
    const data = await request<any[]>("/quiz_attempts");
    return data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async createAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at' | 'completed_at'>) {
    return request<QuizAttempt>("/quiz_attempts", { method: "POST", body: JSON.stringify(attempt) });
  },
};

export const challengesApi = {
  async getAllChallenges() {
    return request<Challenge[]>("/challenges");
  },

  async getChallenge(id: string) {
    return request<Challenge | null>(`/challenges/${id}`);
  },

  async createChallenge(challenge: Omit<Challenge, 'id' | 'created_at'>) {
    return request<Challenge>("/challenges", { method: "POST", body: JSON.stringify(challenge) });
  },

  async updateChallenge(id: string, updates: Partial<Challenge>) {
    return request<Challenge>(`/challenges/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async deleteChallenge(id: string) {
    await request<void>(`/challenges/${id}`, { method: "DELETE" });
  },
};

export const challengeProgressApi = {
  async getStudentProgress(studentId: string) {
    const data = await request<any[]>("/challenge_progress");
    return data.filter((item) => item.student_id === studentId);
  },

  async getChallengeProgress(challengeId: string, studentId: string) {
    const data = await request<ChallengeProgress[]>("/challenge_progress");
    return data.find((item) => item.challenge_id === challengeId && item.student_id === studentId) ?? null;
  },

  async getAllProgress(page = 0) {
    const data = await request<any[]>("/challenge_progress");
    return data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async createOrUpdateProgress(progress: Omit<ChallengeProgress, 'id' | 'created_at' | 'updated_at'>) {
    const existing = await this.getChallengeProgress(progress.challenge_id, progress.student_id);
    if (existing) {
      return request<ChallengeProgress>(`/challenge_progress/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(progress),
      });
    }
    return request<ChallengeProgress>("/challenge_progress", { method: "POST", body: JSON.stringify(progress) });
  },
};

export const badgesApi = {
  async getAllBadges() {
    return request<Badge[]>("/badges");
  },

  async getUserBadges(userId: string) {
    const data = await request<any[]>("/user_badges");
    return data.filter((item) => item.user_id === userId);
  },

  async awardBadge(userId: string, badgeId: string) {
    return request<UserBadge>("/user_badges", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, badge_id: badgeId }),
    });
  },
};

export const ecoActionsApi = {
  async getStudentActions(studentId: string, page = 0) {
    const data = await request<EcoAction[]>("/eco_actions");
    return data.filter((item) => item.student_id === studentId).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async getPendingActions(page = 0) {
    const data = await request<EcoActionWithDetails[]>("/eco_actions");
    return data.filter((item) => item.status === "pending").slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async getAllActions(page = 0) {
    const data = await request<EcoActionWithDetails[]>("/eco_actions");
    return data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  },

  async createAction(action: Omit<EcoAction, 'id' | 'submitted_at' | 'reviewed_at' | 'status'>) {
    return request<EcoAction>("/eco_actions", { method: "POST", body: JSON.stringify(action) });
  },

  async updateAction(id: string, updates: Partial<EcoAction>) {
    return request<EcoAction>(`/eco_actions/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  },

  async reviewAction(id: string, status: 'approved' | 'rejected', reviewedBy: string, reviewNotes?: string) {
    return request<EcoAction>(`/eco_actions/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        reviewed_by: reviewedBy,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      }),
    });
  },
};

export const leaderboardApi = {
  async getLeaderboard(page = 0) {
    const profiles = await request<Profile[]>("/profiles");
    return profiles
      .sort((a, b) => b.total_points - a.total_points)
      .map((profile, index) => ({ ...profile, badge_count: 0, rank: index + 1 })) as LeaderboardEntry[];
  },

  async getUserRank(userId: string) {
    const leaderboard = await this.getLeaderboard(0);
    return leaderboard.find((entry) => entry.id === userId) ?? null;
  },
};

export const storageApi = {
  async uploadEcoActionImage(file: File, userId: string): Promise<string> {
    const token = authStore.getToken();
    const form = new FormData();
    form.append("file", file);
    form.append("userId", userId);
    const response = await fetch(`${API_BASE}/uploads/eco-actions`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return `${import.meta.env.VITE_API_ORIGIN || "http://localhost:4000"}${data.url}`;
  },

  async deleteEcoActionImage(url: string) {
    void url;
  },
};
