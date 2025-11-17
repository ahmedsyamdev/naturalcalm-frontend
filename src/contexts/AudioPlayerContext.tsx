/**
 * Audio Player Context
 * Manages audio playback state across the application
 */

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { AudioService } from "@/lib/api/services/AudioService";
import { useToast } from "@/hooks/use-toast";
import { downloadService } from "@/lib/downloadService";

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playlist: Track[];
  currentTrackIndex: number;
  currentProgramId: string | null;
  isBuffering: boolean;
  streamError: string | null;
  playbackSpeed: number;
  playTrack: (track: Track, playlist?: Track[], programId?: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  retryStream: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSessionId = useRef<string | null>(null);
  const currentProgramIdRef = useRef<string | null>(null);
  const streamUrlExpiry = useRef<number | null>(null);
  const sessionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const endCurrentSession = async (completed: boolean) => {
    if (currentSessionId.current) {
      try {
        await AudioService.endSession(currentSessionId.current, { completed });
      } catch (error) {
        console.error('Failed to end session:', error);
      } finally {
        currentSessionId.current = null;
      }
    }
  };

  const cleanupSession = async () => {
    if (currentSessionId.current) {
      await endCurrentSession(false);
    }
    if (sessionUpdateInterval.current) {
      clearInterval(sessionUpdateInterval.current);
      sessionUpdateInterval.current = null;
    }
  };

  const updateSession = async () => {
    if (currentSessionId.current && audioRef.current) {
      try {
        await AudioService.updateSession(currentSessionId.current, {
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
        });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }
  };

  const startSessionTracking = () => {
    if (sessionUpdateInterval.current) {
      clearInterval(sessionUpdateInterval.current);
    }

    sessionUpdateInterval.current = setInterval(updateSession, 30000);
  };

  const getStreamingUrl = async (track: Track): Promise<string> => {
    // First, check if track is downloaded for offline playback
    try {
      const isDownloaded = await downloadService.isTrackDownloaded(track.id);
      if (isDownloaded) {
        const offlineUrl = await downloadService.getDownloadedTrackAudio(track.id);
        if (offlineUrl) {
          console.log('Playing from offline storage');
          return offlineUrl;
        }
      }
    } catch (error) {
      console.warn('Failed to check offline storage:', error);
    }

    // If not downloaded, stream from server
    const now = Date.now();

    if (track.streamUrl && streamUrlExpiry.current && now < streamUrlExpiry.current) {
      return track.streamUrl;
    }

    try {
      setIsBuffering(true);
      const streamResponse = await AudioService.getStreamUrl(track.id);

      streamUrlExpiry.current = now + (streamResponse.expiresIn * 1000);

      return streamResponse.url;
    } catch (error) {
      console.error('Failed to get stream URL:', error);

      if (track.audioUrl) {
        return track.audioUrl;
      }

      return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    } finally {
      setIsBuffering(false);
    }
  };

  const preloadNextTrack = async () => {
    if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
      const nextTrack = playlist[currentTrackIndex + 1];

      if (nextTrack && !nextTrack.isPremium) {
        try {
          const streamUrl = await getStreamingUrl(nextTrack);

          if (!preloadAudioRef.current) {
            preloadAudioRef.current = new Audio();
          }

          preloadAudioRef.current.src = streamUrl;
          preloadAudioRef.current.preload = 'auto';
        } catch (error) {
          console.error('Failed to preload next track:', error);
        }
      }
    }
  };

  const playTrack = async (track: Track, newPlaylist?: Track[], programId?: string) => {
    setStreamError(null);

    try {
      await cleanupSession();
    } catch (error) {
      console.error('Failed to cleanup session:', error);
    }

    if (newPlaylist) {
      setPlaylist(newPlaylist);
      const index = newPlaylist.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    }

    if (programId) {
      currentProgramIdRef.current = programId;
      setCurrentProgramId(programId);
    } else {
      currentProgramIdRef.current = null;
      setCurrentProgramId(null);
    }

    setCurrentTrack(track);

    if (audioRef.current) {
      try {
        const streamUrl = await getStreamingUrl(track);
        audioRef.current.src = streamUrl;
        audioRef.current.playbackRate = playbackSpeed;

        await audioRef.current.play();
        setIsPlaying(true);

        try {
          const session = await AudioService.startSession({
            trackId: track.id,
            programId: currentProgramIdRef.current || undefined,
          });

          currentSessionId.current = session.id;
          startSessionTracking();
        } catch (sessionError) {
          console.warn('Failed to start session tracking (backend may not be available):', sessionError);
        }

        try {
          preloadNextTrack();
        } catch (preloadError) {
          console.warn('Failed to preload next track:', preloadError);
        }
      } catch (error) {
        console.error('Failed to play track:', error);
        setStreamError('فشل تشغيل المقطع');
        setIsPlaying(false);
      }
    }
  };

  const pauseTrack = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);

      await updateSession();

      if (sessionUpdateInterval.current) {
        clearInterval(sessionUpdateInterval.current);
        sessionUpdateInterval.current = null;
      }
    }
  };

  const resumeTrack = async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);

        startSessionTracking();
      } catch (error) {
        console.error('Failed to resume track:', error);
        setStreamError('فشل استئناف التشغيل');
      }
    }
  };

  const nextTrack = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
      playTrack(playlist[nextIndex], playlist, currentProgramIdRef.current || undefined);
    }
  };

  const previousTrack = () => {
    if (playlist.length > 0) {
      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      playTrack(playlist[prevIndex], playlist, currentProgramIdRef.current || undefined);
    }
  };

  const seekTo = async (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);

      await updateSession();
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const retryStream = () => {
    if (currentTrack) {
      setStreamError(null);
      playTrack(currentTrack, playlist, currentProgramIdRef.current || undefined);
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener("ended", async () => {
        await endCurrentSession(true);
        if (playlist.length > 0) {
          const nextIndex = (currentTrackIndex + 1) % playlist.length;
          setCurrentTrackIndex(nextIndex);
          const nextTrackItem = playlist[nextIndex];
          if (nextTrackItem) {
            await playTrack(nextTrackItem, playlist, currentProgramIdRef.current || undefined);
          }
        }
      });

      audioRef.current.addEventListener("error", (error: Event) => {
        const audioError = (error.target as HTMLAudioElement).error;
        const errorMessage = audioError
          ? `خطأ في التحميل (${audioError.code})`
          : 'فشل تحميل المقطع الصوتي';

        setStreamError(errorMessage);
        setIsBuffering(false);

        toast({
          title: "خطأ في التشغيل",
          description: errorMessage,
          variant: "destructive",
        });
      });

      audioRef.current.addEventListener("waiting", () => setIsBuffering(true));
      audioRef.current.addEventListener("canplay", () => setIsBuffering(false));
      audioRef.current.addEventListener("loadstart", () => setIsBuffering(true));
      audioRef.current.addEventListener("loadeddata", () => setIsBuffering(false));
    }

    const savedSpeed = localStorage.getItem('playbackSpeed');
    if (savedSpeed) {
      setPlaybackSpeed(parseFloat(savedSpeed));
    }

    return () => {
      cleanupSession();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (sessionUpdateInterval.current) {
        clearInterval(sessionUpdateInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      localStorage.setItem('playbackSpeed', playbackSpeed.toString());
    }
  }, [playbackSpeed]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playlist,
        currentTrackIndex,
        currentProgramId,
        isBuffering,
        streamError,
        playbackSpeed,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        setPlaybackSpeed,
        retryStream,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

