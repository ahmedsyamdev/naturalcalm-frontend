/**
 * TrackPlayer Page
 * Full-screen audio player with controls and playlist
 */

import { useEffect, useState } from "react";
import { ArrowRight, Heart, MoreVertical, Play, Pause, SkipBack, SkipForward, Loader2, RotateCcw, Gauge, Download, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTrackById, useTracks } from "@/hooks/queries/useTracks";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccessContent } from "@/lib/contentAccess";
import { useCurrentSubscription } from "@/hooks/queries/useSubscription";
import { useIsDownloaded, useDownloadTrack } from "@/hooks/useDownload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const TrackPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTo,
    nextTrack,
    previousTrack,
    isBuffering,
    streamError,
    playbackSpeed,
    setPlaybackSpeed,
    retryStream,
    playlist,
    currentTrackIndex,
    currentProgramId,
  } = useAudioPlayer();
  const { isTrackFavorite, toggleTrackFavorite } = useFavorites();

  const { data: track, isLoading, isError, error } = useTrackById(id || "");
  const { data: allTracks } = useTracks();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const displayTrack = currentTrack || track;
  const isFavorite = displayTrack ? isTrackFavorite(displayTrack.id) : false;

  // Get user subscription from API
  const { data: subscriptionData, isLoading: subscriptionLoading } = useCurrentSubscription();
  const userSubscriptionType = subscriptionData?.packageId?.type || 'free';
  const isPremiumUser = userSubscriptionType === 'premium';
  const contentAccess = track?.contentAccess || (track?.isPremium ? 'premium' : 'free');
  const hasAccess = canAccessContent(contentAccess, userSubscriptionType);

  // Download functionality
  const { isDownloaded, refetch: refetchDownloadStatus } = useIsDownloaded(displayTrack?.id || '');
  const { downloadTrack, isDownloading } = useDownloadTrack();

  const handleDownload = async () => {
    if (!displayTrack || !isPremiumUser) return;

    if (isDownloaded || isDownloading) return;

    const success = await downloadTrack(displayTrack);
    if (success) {
      refetchDownloadStatus();
    }
  };

  // Redirect to subscription page if user doesn't have access
  // Wait for subscription to finish loading before redirecting
  useEffect(() => {
    if (track && !subscriptionLoading && !hasAccess) {
      navigate('/subscription');
    }
  }, [track, subscriptionLoading, hasAccess, navigate]);

  const playbackSpeeds = [
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "عادي" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  useEffect(() => {
    const initializeTrack = async () => {
      if (track && allTracks && (!currentTrack || currentTrack.id !== track.id)) {
        try {
          await playTrack(track, allTracks);
        } catch (error) {
          console.error('Failed to initialize track:', error);
        }
      }
    };

    initializeTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, allTracks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-primary/80 flex flex-col items-center justify-center" dir="rtl">
        <div className="space-y-4 w-full px-5">
          <Skeleton className="w-[280px] h-[280px] rounded-3xl mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-primary/80 flex items-center justify-center" dir="rtl">
        <div className="text-center text-white px-5">
          <p className="text-lg mb-4">خطأ في تحميل المقطع</p>
          <p className="text-sm mb-4 opacity-80">{error?.message || 'حدث خطأ'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-primary rounded-full">
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (!track && !currentTrack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-primary/80 flex items-center justify-center" dir="rtl">
        <div className="text-center text-white px-5">
          <p className="text-lg mb-4">المقطع غير موجود</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-primary rounded-full">
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" dir="rtl">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={displayTrack?.imageUrl}
          alt={displayTrack?.title}
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Subtle Liquid Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      {/* Header */}
      <div className="px-5 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <DropdownMenu open={showSpeedMenu} onOpenChange={setShowSpeedMenu}>
            <DropdownMenuTrigger asChild>
              <button className="w-11 h-11 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 transition-all border border-white/30 shadow-lg">
                <Gauge className="w-5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {playbackSpeeds.map((speed) => (
                <DropdownMenuItem
                  key={speed.value}
                  onClick={() => setPlaybackSpeed(speed.value)}
                  className={cn(
                    "cursor-pointer justify-center",
                    playbackSpeed === speed.value && "bg-primary text-white"
                  )}
                >
                  {speed.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => navigate(-1)} className="w-11 h-11 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 transition-all border border-white/30 shadow-lg">
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Spacer to push controls to bottom */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-sm">جاري التحميل...</p>
            </div>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="px-5 pb-4 relative z-10">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Stream Error */}
          {streamError && (
            <div className="mb-4 bg-red-500/20 border border-red-500/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 text-center">
                  <p className="text-white text-sm mb-2">{streamError}</p>
                  <Button
                    onClick={retryStream}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-xl"
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Track Info */}
          <div className="text-center text-white mb-6 space-y-2">
            <h1 className="text-2xl font-bold drop-shadow-lg">{displayTrack?.title}</h1>
            <div className="flex items-center gap-2 justify-center text-sm opacity-90">
              <span className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">{displayTrack?.level}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                {typeof displayTrack?.category === 'string'
                  ? displayTrack.category
                  : (displayTrack?.category as any)?.name || ''}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-white/90 font-medium">
              <span>{formatTime(duration - currentTime)}</span>
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <button
              onClick={previousTrack}
              className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 hover:scale-90 transition-all border border-white/30 shadow-lg"
            >
              <SkipForward className="w-7 h-7 text-white rotate-180" />
            </button>

            <button
              onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
              className="w-24 h-24 bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all border-4 border-white/50"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-primary" fill="currentColor" />
              ) : (
                <Play className="w-10 h-10 text-primary ml-1" fill="currentColor" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 hover:scale-90 transition-all border border-white/30 shadow-lg"
            >
              <SkipForward className="w-7 h-7 text-white" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {/* Add to Favorites */}
            <button
              onClick={() => displayTrack && toggleTrackFavorite(displayTrack.id, isFavorite)}
              className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 hover:scale-90 transition-all border border-white/30 shadow-lg"
            >
              <Heart className={cn("w-6 h-6 text-white", isFavorite && "fill-white")} />
            </button>

            {/* Download Button - Only for premium users */}
            {isPremiumUser && displayTrack && (
              <button
                onClick={handleDownload}
                disabled={isDownloading || isDownloaded}
                className={cn(
                  "w-16 h-16 bg-gradient-to-br backdrop-blur-xl rounded-full flex items-center justify-center transition-all border shadow-lg",
                  isDownloaded
                    ? "from-green-500/30 to-green-600/20 border-green-400/40"
                    : "from-white/20 to-white/10 border-white/30 hover:from-white/30 hover:to-white/20 hover:scale-90",
                  (isDownloading || isDownloaded) && "cursor-not-allowed"
                )}
              >
                {isDownloading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : isDownloaded ? (
                  <CheckCircle className="w-6 h-6 text-green-300 fill-green-300" />
                ) : (
                  <Download className="w-6 h-6 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Section - Only show when playing from a program */}
      {currentProgramId && playlist && playlist.length > 1 && (
        <div className="px-5 pb-8 relative z-10">
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl rounded-[2rem] p-5 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <h2 className="text-white text-lg font-bold mb-4 text-right">قائمة التشغيل ({playlist.length})</h2>
            <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {playlist.map((track, index) => {
                const isCurrentTrack = index === currentTrackIndex;
                const isCurrentlyPlaying = isCurrentTrack && isPlaying;

                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      if (!isCurrentTrack) {
                        playTrack(track, playlist);
                      } else if (isPlaying) {
                        pauseTrack();
                      } else {
                        resumeTrack();
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right group",
                      isCurrentTrack
                        ? "bg-white/20 border border-white/40"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    )}
                  >
                    {/* Track Number / Play Icon */}
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      {isCurrentlyPlaying ? (
                        <div className="flex gap-0.5 items-center">
                          <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-0.5 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <span className={cn(
                          "text-sm font-medium",
                          isCurrentTrack ? "text-white" : "text-white/60 group-hover:text-white/80"
                        )}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Track Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0 text-right">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrentTrack ? "text-white" : "text-white/90"
                      )}>
                        {track.title}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {typeof track.category === 'string'
                          ? track.category
                          : (track.category as any)?.name || ''}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="text-xs text-white/60 shrink-0">
                      {track.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPlayer;

