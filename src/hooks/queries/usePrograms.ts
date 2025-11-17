/**
 * React Query hooks for Programs
 */

import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/lib/api/services/ContentService';
import { ProgramFilters } from '@/types/filters';

export const usePrograms = (filters?: ProgramFilters) => {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: () => ContentService.getPrograms(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProgramById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['programs', id],
    queryFn: () => ContentService.getProgramById(id),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

export const useProgramTracks = (programId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['programs', programId, 'tracks'],
    queryFn: () => ContentService.getProgramTracks(programId),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!programId,
  });
};

export const useFeaturedPrograms = () => {
  return useQuery({
    queryKey: ['programs', 'featured'],
    queryFn: () => ContentService.getFeaturedPrograms(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProgramsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['programs', 'category', categoryId],
    queryFn: () => ContentService.getProgramsByCategory(categoryId),
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
};
