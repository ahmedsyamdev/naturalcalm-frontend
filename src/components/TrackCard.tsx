/**
 * TrackCard Component
 * Displays an audio track with image, title, level badge, and stats
 */

import { Heart, Clock, Users, Lock, Crown, Shield, Download, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Track } from "@/types";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/config";
import { useFavorites } from "@/contexts/FavoritesContext";
import { canAccessContent, getAccessLevelLabel } from "@/lib/contentAccess";
import { useCurrentSubscription } from "@/hooks/queries/useSubscription";
import { useIsDownloaded, useDownloadTrack, useDeleteDownload } from "@/hooks/useDownload";

interface TrackCardProps {
  track: Track;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
}

const TrackCard = ({ track, onToggleFavorite, onClick }: TrackCardProps) => {
  const navigate = useNavigate();
  const { isTrackFavorite, toggleTrackFavorite } = useFavorites();
  const isFavorite = isTrackFavorite(track.id);

  // Get user subscription from API
  const { data: subscriptionData } = useCurrentSubscription();
  const userSubscriptionType = subscriptionData?.packageId?.type || 'free';
  const isPremiumUser = userSubscriptionType === 'premium';

  // Determine content access - use contentAccess if available, fallback to isPremium
  const contentAccess = track.contentAccess || (track.isPremium ? 'premium' : 'free');
  const hasAccess = canAccessContent(contentAccess, userSubscriptionType);

  // Download functionality
  const { isDownloaded, refetch: refetchDownloadStatus } = useIsDownloaded(track.id);
  const { downloadTrack, isDownloading } = useDownloadTrack();
  const { deleteDownload } = useDeleteDownload();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track?.id) {
      console.error('Track ID is undefined');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(track.id);
    } else {
      toggleTrackFavorite(track.id, isFavorite);
    }
  };

  const handleClick = () => {
    if (!hasAccess) {
      navigate('/subscription');
    } else if (onClick) {
      onClick();
    }
  };

  const handleDownloadToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isPremiumUser) {
      navigate('/subscription');
      return;
    }

    if (isDownloading) return;

    // If already downloaded, delete it
    if (isDownloaded) {
      const success = await deleteDownload(track.id, track.title);
      if (success) {
        refetchDownloadStatus();
      }
      return;
    }

    // Download the track (hook will get the URL from backend)
    const success = await downloadTrack(track);
    if (success) {
      refetchDownloadStatus();
    }
  };

  return (
    <div
      className="relative w-[170px] h-[200px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
      onClick={handleClick}
    >
      {/* Background Image */}
      <img 
        src={getImageUrl(track.imageUrl)} 
        alt={track.title} 
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start">
        {/* Access Level Badge */}
        {contentAccess !== 'free' && (
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
        )}

        {/* Download Badge - Only for premium users with access */}
        {isPremiumUser && hasAccess && (
          <button
            onClick={handleDownloadToggle}
            className={cn(
              "backdrop-blur-sm rounded-full p-1.5 shadow-lg transition-all",
              isDownloaded ? "bg-green-500/90" : "bg-black/30 hover:bg-black/50"
            )}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : isDownloaded ? (
              <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <Download className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        )}
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

            {/* Track Info */}
            <div className="text-right space-y-1">
              <h3 className="text-xs font-medium">{track.title}</h3>
              
              {/* Level Badge */}
              <div className="inline-block backdrop-blur-sm bg-white/90 px-1.5 py-0.5 rounded-full">
                <span className="text-[8px] text-black font-medium">{track.level}</span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-1 text-[9px] items-center justify-end">
                <div className="flex items-center gap-0.5">
                  <span>{track.duration}</span>
                  <Clock className="w-2.5 h-2.5" />
                </div>
                <div className="flex items-center gap-0.5">
                  <span>{track.plays}</span>
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

export default TrackCard;

