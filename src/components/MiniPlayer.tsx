import { X, Play, Pause, SkipForward } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const getCategoryName = (category: unknown): string => {
  if (!category) return '';
  if (typeof category === 'string') return isMongoId(category) ? '' : category;
  if (typeof category === 'object' && category !== null) {
    return (category as { name?: string }).name || '';
  }
  return '';
};

const MiniPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    pauseTrack,
    resumeTrack,
    nextTrack,
    closePlayer,
    playlist,
    currentTrackIndex,
    currentProgramId,
  } = useAudioPlayer();

  if (!currentTrack || location.pathname.startsWith('/player')) {
    return null;
  }

  const isInPlaylist = currentProgramId && playlist.length > 1;
  const categoryName = getCategoryName(currentTrack.category);
  const subtitle = isInPlaylist
    ? `${currentTrackIndex + 1} / ${playlist.length}`
    : categoryName;

  return (
    <div className="fixed bottom-[108px] left-5 right-5 z-40" dir="rtl">
      <div className="bg-primary rounded-2xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.2)] border border-white/20 flex items-center px-3 py-2 gap-3">
        {/* Track image */}
        <img
          src={currentTrack.imageUrl}
          alt={currentTrack.title}
          className="w-11 h-11 rounded-xl object-cover shrink-0 cursor-pointer"
          onClick={() => navigate(`/player/${currentTrack.id}`)}
        />

        {/* Track info */}
        <div
          className="flex-1 min-w-0 text-right cursor-pointer"
          onClick={() => navigate(`/player/${currentTrack.id}`)}
        >
          <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
          {subtitle && (
            <p className="text-white/70 text-xs truncate">{subtitle}</p>
          )}
        </div>

        {/* Skip next — only when in a playlist */}
        {isInPlaylist && (
          <button
            onClick={nextTrack}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Play/Pause */}
        <button
          onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary" fill="currentColor" />
          ) : (
            <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={closePlayer}
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
