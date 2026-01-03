
export type AppState = 'dashboard' | 'study' | 'quiz' | 'results';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  questions: Question[];
  xpReward: number;
}

export interface UserProgress {
  xp: number;
  completedModules: string[];
  moduleScores: Record<string, number>;
}

export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  score: number;
  answers: number[];
}
