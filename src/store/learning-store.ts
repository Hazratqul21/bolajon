import { create } from 'zustand';
import type { Progress, LearningSession } from '@/types/learning';
import type { AIFeedback } from '@/types/api';

interface LearningState {
  currentLetterIndex: number;
  currentWordIndex: number;
  isRecording: boolean;
  currentFeedback: AIFeedback | null;
  progress: Progress[];
  sessions: LearningSession[];
  
  setCurrentLetterIndex: (index: number) => void;
  setCurrentWordIndex: (index: number) => void;
  setIsRecording: (recording: boolean) => void;
  setCurrentFeedback: (feedback: AIFeedback | null) => void;
  setProgress: (progress: Progress[]) => void;
  addSession: (session: LearningSession) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  currentLetterIndex: 0,
  currentWordIndex: 0,
  isRecording: false,
  currentFeedback: null,
  progress: [],
  sessions: [],
  
  setCurrentLetterIndex: (index) => set({ currentLetterIndex: index }),
  setCurrentWordIndex: (index) => set({ currentWordIndex: index }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setCurrentFeedback: (feedback) => set({ currentFeedback: feedback }),
  setProgress: (progress) => set({ progress }),
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  reset: () =>
    set({
      currentLetterIndex: 0,
      currentWordIndex: 0,
      isRecording: false,
      currentFeedback: null,
    }),
}));

