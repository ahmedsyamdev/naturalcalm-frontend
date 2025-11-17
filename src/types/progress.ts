/**
 * Progress tracking types for user programs and tracks
 */

export interface ProgramProgress {
  completedTracks: string[];
  progress: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  isCompleted: boolean;
  completedAt?: string;
  totalTracksCount: number;
  completedTracksCount: number;
}

export interface TrackProgress {
  trackId: string;
  completed: boolean;
  lastPosition: number;
  duration: number;
}
