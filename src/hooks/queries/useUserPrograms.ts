/**
 * React Query hooks for User Programs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProgramsService } from '@/lib/api/services/UserProgramsService';
import { Program, CustomProgram } from '@/types';
import { ProgramProgress } from '@/types/progress';

export const useEnrolledPrograms = () => {
  return useQuery({
    queryKey: ['user', 'programs', 'enrolled'],
    queryFn: () => UserProgramsService.getEnrolledPrograms(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCustomPrograms = () => {
  return useQuery({
    queryKey: ['user', 'programs', 'custom'],
    queryFn: () => UserProgramsService.getCustomPrograms(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCustomProgramById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['user', 'programs', 'custom', id],
    queryFn: () => UserProgramsService.getCustomProgramById(id),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

export const useProgramProgress = (
  programId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['user', 'programs', programId, 'progress'],
    queryFn: () => UserProgramsService.getProgramProgress(programId),
    staleTime: 1 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!programId,
  });
};

export const useEnrollInProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => UserProgramsService.enrollInProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'programs', 'enrolled'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};

export const useMarkTrackComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, trackId }: { programId: string; trackId: string }) =>
      UserProgramsService.markTrackComplete(programId, trackId),
    onMutate: async ({ programId, trackId }) => {
      await queryClient.cancelQueries({
        queryKey: ['user', 'programs', programId, 'progress'],
      });

      const previousProgress = queryClient.getQueryData<ProgramProgress>([
        'user',
        'programs',
        programId,
        'progress',
      ]);

      queryClient.setQueryData<ProgramProgress>(
        ['user', 'programs', programId, 'progress'],
        (old) => {
          if (!old) return old;
          const completedTracks = [...old.completedTracks];
          if (!completedTracks.includes(trackId)) {
            completedTracks.push(trackId);
          }
          const newProgress = old.totalTracksCount > 0
            ? (completedTracks.length / old.totalTracksCount) * 100
            : 0;
          return {
            ...old,
            completedTracks,
            progress: newProgress,
            lastAccessedAt: new Date().toISOString(),
            completedTracksCount: completedTracks.length,
          };
        }
      );

      return { previousProgress };
    },
    onError: (_error, { programId }, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ['user', 'programs', programId, 'progress'],
          context.previousProgress
        );
      }
    },
    onSettled: (_data, _error, { programId }) => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'programs', programId, 'progress'],
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'programs', 'enrolled'] });
    },
  });
};

export const useCreateCustomProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, trackIds }: { name: string; trackIds: string[] }) =>
      UserProgramsService.createCustomProgram(name, trackIds),
    onMutate: async ({ name, trackIds }) => {
      await queryClient.cancelQueries({ queryKey: ['user', 'programs', 'custom'] });

      const previousCustomPrograms = queryClient.getQueryData<CustomProgram[]>([
        'user',
        'programs',
        'custom',
      ]);

      const optimisticProgram: CustomProgram = {
        id: `temp-${Date.now()}`,
        name,
        trackIds,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<CustomProgram[]>(
        ['user', 'programs', 'custom'],
        (old = []) => [...old, optimisticProgram]
      );

      return { previousCustomPrograms };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCustomPrograms) {
        queryClient.setQueryData(
          ['user', 'programs', 'custom'],
          context.previousCustomPrograms
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'programs', 'custom'] });
    },
  });
};

export const useUpdateCustomProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomProgram> }) =>
      UserProgramsService.updateCustomProgram(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'programs', 'custom'] });
    },
  });
};

export const useDeleteCustomProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserProgramsService.deleteCustomProgram(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['user', 'programs', 'custom'] });

      const previousCustomPrograms = queryClient.getQueryData<CustomProgram[]>([
        'user',
        'programs',
        'custom',
      ]);

      queryClient.setQueryData<CustomProgram[]>(
        ['user', 'programs', 'custom'],
        (old = []) => old.filter((program) => program.id !== id)
      );

      return { previousCustomPrograms };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCustomPrograms) {
        queryClient.setQueryData(
          ['user', 'programs', 'custom'],
          context.previousCustomPrograms
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'programs', 'custom'] });
    },
  });
};
