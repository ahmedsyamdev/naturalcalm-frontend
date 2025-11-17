/**
 * React Query hooks for Favorites
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoritesService } from '@/lib/api/services/FavoritesService';
import { Track, Program } from '@/types';

export const useFavoriteTracks = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['favorites', 'tracks'],
    queryFn: () => FavoritesService.getFavoriteTracks(),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useFavoritePrograms = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['favorites', 'programs'],
    queryFn: () => FavoritesService.getFavoritePrograms(),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useToggleTrackFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackId, isFavorite }: { trackId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await FavoritesService.removeTrackFromFavorites(trackId);
      } else {
        await FavoritesService.addTrackToFavorites(trackId);
      }
    },
    onMutate: async ({ trackId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', 'tracks'] });

      const previousTracks = queryClient.getQueryData<Track[]>(['favorites', 'tracks']);

      queryClient.setQueryData<Track[]>(['favorites', 'tracks'], (old = []) => {
        if (isFavorite) {
          return old.filter((track) => track.id !== trackId);
        } else {
          return old;
        }
      });

      return { previousTracks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTracks) {
        queryClient.setQueryData(['favorites', 'tracks'], context.previousTracks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'tracks'] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
};

export const useToggleProgramFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programId, isFavorite }: { programId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await FavoritesService.removeProgramFromFavorites(programId);
      } else {
        await FavoritesService.addProgramToFavorites(programId);
      }
    },
    onMutate: async ({ programId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', 'programs'] });

      const previousPrograms = queryClient.getQueryData<Program[]>(['favorites', 'programs']);

      queryClient.setQueryData<Program[]>(['favorites', 'programs'], (old = []) => {
        if (isFavorite) {
          return old.filter((program) => program.id !== programId);
        } else {
          return old;
        }
      });

      return { previousPrograms };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPrograms) {
        queryClient.setQueryData(['favorites', 'programs'], context.previousPrograms);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};
