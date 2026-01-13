
export type AppState = 'auth' | 'dashboard' | 'teacher-dashboard' | 'teacher-assign' | 'teacher-analytics' | 'notes-hub' | 'ai-chat' | 'arcade' | 'study' | 'quiz' | 'results' | 'settings' | 'leaderboard';
export type Role = 'student' | 'teacher' | 'parent';
export type Difficulty = 'easy' | 'standard' | 'expert';
export type Language = 'english' | 'marathi' | 'hindi';
export type Grade = '6' | '7' | '8' | '9' | '10';

export interface StudentStats {
  id: string;
  name: string;
  grade: Grade;
  xp: number;
  completedModules: string[];
  lastActive: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
  topic: string;
}

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  dueDate: string;
  xpReward: number;
  questions: Question[];
  submissions: number;
}

export interface DailyQuest {
  id: string;
  text: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  subtitle: string;
  content: string[];
  questions: Question[];
  xpReward: number;
}

export interface UploadedDoc {
  id: string;
  title: string;
  type: 'PDF' | 'PPT' | 'TXT';
  timestamp: number;
  isAnalyzed: boolean;
}

export interface CustomQuiz {
  id: string;
  title: string;
  sourceDocId: string;
  questions: Question[];
}

export interface UserProgress {
  username: string;
  role: Role;
  grade: Grade;
  xp: number;
  level: number;
  completedModules: string[];
  downloadedModules: string[];
  language: Language;
  badges: string[];
  streak: number;
  isLiteMode: boolean;
  isHighContrast: boolean;
  isReadAloud: boolean;
}

export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  score: number;
  mode: Difficulty;
  filteredQuestions: Question[];
  isCustom?: boolean;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}
