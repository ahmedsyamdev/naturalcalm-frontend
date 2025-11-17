/**
 * ProgramCard Component
 * Displays a program with thumbnail images, title, level, and stats
 */

import { Heart, Clock, Users, Lock, Crown, Shield, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Program } from "@/types";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/config";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { canAccessContent, getAccessLevelLabel } from "@/lib/contentAccess";
import { useCurrentSubscription } from "@/hooks/queries/useSubscription";
import { useProgramTracks } from "@/hooks/queries/usePrograms";

interface ProgramCardProps {
  program: Program;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
  size?: "default" | "large";
}

const ProgramCard = ({ program, onToggleFavorite, onClick, size = "default" }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { isProgramFavorite, toggleProgramFavorite } = useFavorites();
  const { playTrack } = useAudioPlayer();
  const isFavorite = isProgramFavorite(program.id);
  const isLarge = size === "large";

  // Get user subscription from API
  const { data: subscriptionData } = useCurrentSubscription();
  const userSubscriptionType = subscriptionData?.packageId?.type || 'free';

  // Determine content access - use contentAccess if available, fallback to isPremium
  const contentAccess = program.contentAccess || (program.isPremium ? 'premium' : 'free');
  const hasAccess = canAccessContent(contentAccess, userSubscriptionType);

  // Fetch program tracks for play functionality
  const { data: tracks } = useProgramTracks(program.id, { enabled: hasAccess });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!program?.id) {
      console.error('Program ID is undefined');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(program.id);
    } else {
      toggleProgramFavorite(program.id, isFavorite);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasAccess) {
      navigate('/subscription');
      return;
    }
    if (tracks && tracks.length > 0) {
      playTrack(tracks[0], tracks, program.id);
      navigate(`/player/${tracks[0].id}`);
    }
  };

  const handleClick = () => {
    if (!hasAccess) {
      navigate('/subscription');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all",
        isLarge ? "w-[220px] h-[220px]" : "w-[170px] h-[220px]"
      )}
      onClick={handleClick}
    >
      {/* Access Level Badge */}
      {contentAccess !== 'free' && (
        <div className="absolute top-3 left-3 z-10">
          <div className={cn(
            "flex items-center gap-1 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg",
            contentAccess === 'premium' ? "bg-yellow-500/90" : "bg-blue-500/90"
          )}>
            {!hasAccess && <Lock className="w-3 h-3 text-white" />}
            {hasAccess && contentAccess === 'premium' && <Crown className="w-3 h-3 text-white" />}
            {hasAccess && contentAccess === 'basic' && <Shield className="w-3 h-3 text-white" />}
            <span className="text-[9px] text-white font-medium">
              {getAccessLevelLabel(contentAccess)}
            </span>
          </div>
        </div>
      )}

      {/* Thumbnail Images Grid */}
      <div className="absolute inset-0 p-2">
        <div className="bg-white rounded-2xl p-2 h-full flex flex-col gap-1">
          {program.thumbnailImages.length >= 3 ? (
            <>
              <div className="flex-1 rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(program.thumbnailImages[0])}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex gap-1 h-[100px]">
                <div className="flex-1 rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(program.thumbnailImages[1])}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1 rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(program.thumbnailImages[2])}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <img
              src={getImageUrl(program.thumbnailUrl)}
              alt=""
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          )}
        </div>
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePlayClick}
          className="w-14 h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Play className="w-6 h-6 text-white" fill="white" />
        </button>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="backdrop-blur-md bg-white/15 rounded-xl p-1.5 text-white">
          <div className="flex items-end justify-between">
            {/* Favorite Icon */}
            <button
              onClick={handleToggleFavorite}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  isFavorite ? "fill-white" : ""
                )}
              />
            </button>

            {/* Program Info */}
            <div className="text-right space-y-1">
              <h3 className="text-xs font-medium">{program.title}</h3>
              
              {/* Stats */}
              <div className="flex gap-1 text-[9px] items-center justify-end">
                <div className="flex items-center gap-0.5">
                  <span>{program.sessions} جلسة</span>
                  <Clock className="w-2.5 h-2.5" />
                </div>
                <div className="flex items-center gap-0.5">
                  <span>{program.totalPlays}</span>
                  <Users className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;

