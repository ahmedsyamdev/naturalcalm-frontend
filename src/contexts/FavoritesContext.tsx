/**
 * Favorites Context
 * Manages user favorites for tracks and programs using API integration
 */

import React, { createContext, useContext, useMemo } from "react";
import { useFavoriteTracks, useFavoritePrograms, useToggleTrackFavorite, useToggleProgramFavorite } from "@/hooks/queries/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FavoritesContextType {
  favoriteTrackIds: string[];
  favoriteProgramIds: string[];
  toggleTrackFavorite: (trackId: string, currentIsFavorite: boolean) => void;
  toggleProgramFavorite: (programId: string, currentIsFavorite: boolean) => void;
  isTrackFavorite: (trackId: string) => boolean;
  isProgramFavorite: (programId: string) => boolean;
  isLoadingTracks: boolean;
  isLoadingPrograms: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: favoriteTracks = [], isLoading: isLoadingTracks } = useFavoriteTracks(isAuthenticated);
  const { data: favoritePrograms = [], isLoading: isLoadingPrograms } = useFavoritePrograms(isAuthenticated);

  const toggleTrackMutation = useToggleTrackFavorite();
  const toggleProgramMutation = useToggleProgramFavorite();

  const favoriteTrackIds = useMemo(() => {
    return favoriteTracks.map(track => track.id);
  }, [favoriteTracks]);

  const favoriteProgramIds = useMemo(() => {
    return favoritePrograms.map(program => program.id);
  }, [favoritePrograms]);

  const toggleTrackFavorite = (trackId: string, currentIsFavorite: boolean) => {
    if (!trackId) {
      console.error('toggleTrackFavorite: trackId is undefined');
      toast({
        title: "حدث خطأ",
        description: "معرف المقطع غير صحيح",
        variant: "destructive",
      });
      return;
    }

    toggleTrackMutation.mutate(
      { trackId, isFavorite: currentIsFavorite },
      {
        onSuccess: () => {
          toast({
            title: currentIsFavorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة",
            description: currentIsFavorite ? "تم إزالة المقطع من المفضلة" : "تم إضافة المقطع للمفضلة",
          });
        },
        onError: () => {
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من تحديث المفضلة. حاول مرة أخرى",
            variant: "destructive",
          });
        },
      }
    );
  };

  const toggleProgramFavorite = (programId: string, currentIsFavorite: boolean) => {
    if (!programId) {
      console.error('toggleProgramFavorite: programId is undefined');
      toast({
        title: "حدث خطأ",
        description: "معرف البرنامج غير صحيح",
        variant: "destructive",
      });
      return;
    }

    toggleProgramMutation.mutate(
      { programId, isFavorite: currentIsFavorite },
      {
        onSuccess: () => {
          toast({
            title: currentIsFavorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة",
            description: currentIsFavorite ? "تم إزالة البرنامج من المفضلة" : "تم إضافة البرنامج للمفضلة",
          });
        },
        onError: () => {
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من تحديث المفضلة. حاول مرة أخرى",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isTrackFavorite = (trackId: string) => {
    return favoriteTrackIds.includes(trackId);
  };

  const isProgramFavorite = (programId: string) => {
    return favoriteProgramIds.includes(programId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteTrackIds,
        favoriteProgramIds,
        toggleTrackFavorite,
        toggleProgramFavorite,
        isTrackFavorite,
        isProgramFavorite,
        isLoadingTracks,
        isLoadingPrograms,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

