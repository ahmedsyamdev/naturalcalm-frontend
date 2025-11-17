/**
 * Filter types for content queries
 */

import { CategoryType, DifficultyLevel, RelaxationType } from './index';

export interface TrackFilters {
  category?: CategoryType;
  level?: DifficultyLevel;
  relaxationType?: RelaxationType;
  minDuration?: number;
  maxDuration?: number;
  isPremium?: boolean;
}

export interface ProgramFilters {
  category?: CategoryType;
  level?: DifficultyLevel;
  minSessions?: number;
  maxSessions?: number;
  isPremium?: boolean;
}

export interface SearchFilters extends TrackFilters, ProgramFilters {
  query?: string;
  type?: 'track' | 'program' | 'all';
}

export interface SearchResults {
  tracks: import('./index').Track[];
  programs: import('./index').Program[];
  total: number;
}
