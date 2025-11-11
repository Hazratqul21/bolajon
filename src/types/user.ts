import type { Progress, Achievement } from './learning';

export interface User {
  id: string;
  name: string;
  age: number;
  email?: string;
  avatar?: string;
  totalStars: number;
  totalScore: number;
  currentLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  progress: Progress[];
  achievements: Achievement[];
}

