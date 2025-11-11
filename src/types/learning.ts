export interface Progress {
  id: string;
  userId: string;
  letter: string;
  letterIndex: number;
  wordsCompleted: number;
  totalWords: number;
  accuracy: number;
  attemptsCount: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningSession {
  id: string;
  userId: string;
  letter: string;
  word: string;
  userSpeech: string;
  isCorrect: boolean;
  aiFeedback: string;
  score: number;
  duration: number;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  stars: number;
  rank: number;
  updatedAt: Date;
}

