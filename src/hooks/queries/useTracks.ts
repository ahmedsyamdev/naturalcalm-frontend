/**
 * React Query hooks for Tracks
 */

import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/lib/api/services/ContentService';
import { TrackFilters } from '@/types/filters';

export const useTracks = (filters?: TrackFilters) => {
  return useQuery({
    queryKey: ['tracks', filters],
    queryFn: () => ContentService.getTracks(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrackById = (id: string) => {
  return useQuery({
    queryKey: ['tracks', id],
    queryFn: () => ContentService.getTrackById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useFeaturedTracks = () => {
  return useQuery({
    queryKey: ['tracks', 'featured'],
    queryFn: () => ContentService.getFeaturedTracks(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTracksByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['tracks', 'category', categoryId],
    queryFn: () => ContentService.getTracksByCategory(categoryId),
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
};
