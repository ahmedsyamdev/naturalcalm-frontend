/**
 * React Query hooks for User Statistics
 */

import { useQuery } from '@tanstack/react-query';
import { ProfileService } from '@/lib/api/services/ProfileService';

export const useStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => ProfileService.getStats(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useWeeklyStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: () => ProfileService.getWeeklyStats(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useRecentTracks = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['history', 'recent'],
    queryFn: () => ProfileService.getRecentTracks(),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useListeningHistory = (page: number = 1, limit: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['history', 'all', page, limit],
    queryFn: () => ProfileService.getListeningHistory(page, limit),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};
