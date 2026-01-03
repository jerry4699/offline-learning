export type AppState = 'auth' | 'role-selection' | 'dashboard' | 'study' | 'quiz' | 'results' | 'teacher' | 'alumni' | 'guest-demo' | 'game' | 'leaderboard' | 'vocabulary-hub' | 'vocab-focus' | 'vocab-match' | 'vocab-recall' | 'practice-notes' | 'notes-quiz' | 'math-duel' | 'logic-grid' | 'fluency-hub' | 'fluency-practice' | 'otp-verify' | 'difficulty-selection';
export type Role = 'student' | 'teacher' | 'alumni' | 'guest';
export type AuthMethod = 'google' | 'mobile' | 'guest';
export type Difficulty = 'easy' | 'standard' | 'expert';
export type Language = 'english' | 'marathi' | 'hindi';

export interface Question {
  id: string;
  text: string;
  textTranslated?: Record<Language, string>;
  options: string[];
  optionsTranslated?: Record<Language, string[]>;
  correctAnswerIndex: number;
  difficulty: Difficulty;
}

export interface Poem {
  id: string;
  title: string;
  titleTranslated: Record<Language, string>;
  lines: string[];
  linesTranslated: Record<Language, string[]>;
  duration: number;
}

export interface Module {
  id: string;
  title: string;
  titleTranslated: Record<Language, string>;
  subtitle: string;
  content: string[];
  contentTranslated: Record<Language, string[]>;
  basicContent: string[];
  questions: Question[];
  xpReward: number;
}

export interface UserProgress {
  username: string;
  email?: string;
  phone?: string;
  role: Role;
  xp: number;
  level: number;
  completedModules: string[];
  moduleScores: Record<string, number>;
  vocabScores: {
    focus: number;
    match: number;
    recall: number;
  };
  vocabCompletion: {
    focus: boolean;
    match: boolean;
    recall: boolean;
  };
  lastSync: string | null;
  difficultyPref: Difficulty;
  language: Language;
  pendingSyncCount: number;
  badges: string[];
  streak: number;
  lastActiveDate: string | null;
  authMethod?: AuthMethod;
}

export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  mode: Difficulty;
  filteredQuestions: Question[];
}