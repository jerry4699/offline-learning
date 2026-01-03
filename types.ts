
export type AppState = 'dashboard' | 'study' | 'quiz' | 'results' | 'teacher' | 'game';
export type Role = 'student' | 'teacher';
export type Difficulty = 'easy' | 'standard' | 'expert';
export type Language = 'english' | 'basic';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  basicContent: string[]; // Added for low-literacy mode
  questions: Question[];
  xpReward: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  completedModules: string[];
  moduleScores: Record<string, number>;
  lastSync: string | null;
  difficultyPref: Difficulty;
  language: Language;
  pendingSyncCount: number; // For demonstrating technical depth
}

export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  mode: Difficulty;
}
