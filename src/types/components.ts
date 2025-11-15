/**
 * Component prop types
 */

import type { AIFeedback } from './api';
import type { Letter, Word } from '@/data/alphabet';

// Onboarding
export interface OnboardingFormProps {
  onComplete: (data: { firstName: string; age: number; preferences?: string[] }) => void;
}

export interface OnboardingData {
  firstName: string;
  age: number;
  preferences?: string[];
}

// Learning Components
export interface LetterCardProps {
  letter: Letter;
  isActive: boolean;
  onClick: () => void;
}

export interface WordPracticeProps {
  word: Word;
  onPlayAudio: () => void;
  isRecording: boolean;
  isPlayingAudio: boolean;
}

export interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  duration?: number;
}

export interface AIFeedbackComponentProps {
  feedback: AIFeedback;
}

// Realtime Components
export interface RealtimeMicButtonProps {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

// Gamification Components
export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export interface StarsDisplayProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

// Layout Components
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface HeaderProps {
  title?: string;
}

