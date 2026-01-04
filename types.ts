
export type AppState = 'auth' | 'role-selection' | 'dashboard' | 'teacher-dashboard' | 'teacher-assign' | 'teacher-analytics' | 'notes-hub' | 'ai-chat' | 'arcade' | 'study' | 'quiz' | 'results' | 'difficulty-selection';
export type Role = 'student' | 'teacher' | 'alumni' | 'guest';
export type AuthMethod = 'google' | 'mobile' | 'guest';
export type Difficulty = 'easy' | 'standard' | 'expert';
export type Language = 'english' | 'marathi' | 'hindi';

export interface StudentStats {
  id: string;
  name: string;
  level: number;
  xp: number;
  progress: number; // 0 to 100
  lastActive: string;
}

export interface Poem {
  id: string;
  title: string;
  titleTranslated: Record<Language, string>;
  lines: string[];
  linesTranslated: Record<Language, string[]>;
  duration: number;
}

export interface Question {
  id: string;
  text: string;
  textTranslated?: Record<Language, string>;
  options: string[];
  optionsTranslated?: Record<Language, string[]>;
  correctAnswerIndex: number;
  difficulty: Difficulty;
}

export interface Module {
  id: string;
  title: string;
  titleTranslated: Record<Language, string>;
  subtitle: string;
  subject: string;
  content: string[];
  contentTranslated: Record<Language, string[]>;
  questions: Question[];
  xpReward: number;
  basicContent?: string[];
}

export interface UserProgress {
  username: string;
  role: Role;
  xp: number;
  level: number;
  completedModules: string[];
  downloadedModules: string[];
  customQuizzes: { id: string, title: string, questions: Question[] }[];
  language: Language;
  badges: string[];
  streak: number;
  // New academic coordinates
  college: string;
  department: string;
  classSection: string;
}

export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  mode: Difficulty;
  filteredQuestions: Question[];
  isCustom?: boolean;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}
