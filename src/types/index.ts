/**
 * Centralized type exports
 */

// API Types
export type {
  AIFeedback,
  SpeechAnalysisRequest,
  SpeechAnalysisResponse,
  ProgressUpdateRequest,
  ApiResponse,
} from './api';

// User Types
export type {
  User,
  UserProfile,
} from './user';

// Learning Types
export type {
  Progress,
  LearningSession,
  Achievement,
  LeaderboardEntry,
} from './learning';

// Component Types
export type {
  OnboardingFormProps,
  OnboardingData,
  LetterCardProps,
  WordPracticeProps,
  VoiceRecorderProps,
  AIFeedbackComponentProps,
  RealtimeMicButtonProps,
  ProgressBarProps,
  StarsDisplayProps,
  LevelBadgeProps,
  SidebarProps,
  HeaderProps,
} from './components';

// Data Types
export type {
  Letter,
  Word,
} from '@/data/alphabet';

