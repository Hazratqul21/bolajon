export interface AIFeedback {
  isCorrect: boolean;
  accuracy: number;
  feedback: string;
  mistakes?: string[];
  encouragement: string;
}

export interface SpeechAnalysisRequest {
  audioBlob: Blob;
  expectedWord: string;
  letter: string;
}

export interface SpeechAnalysisResponse {
  transcribedText: string;
  feedback: AIFeedback;
}

export interface ProgressUpdateRequest {
  letter: string;
  letterIndex: number;
  word: string;
  isCorrect: boolean;
  score: number;
  accuracy: number;
  userSpeech?: string;
  aiFeedback?: string;
  duration?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

