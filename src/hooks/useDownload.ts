/**
 * React hooks for download functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { downloadService } from '@/lib/downloadService';
import { Track } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AudioService } from '@/lib/api/services/AudioService';

/**
 * Hook to check if a track is downloaded
 */
export const useIsDownloaded = (trackId: string) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkDownloaded = useCallback(async () => {
    setIsChecking(true);
    try {
      const downloaded = await downloadService.isTrackDownloaded(trackId);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Error checking download status:', error);
      setIsDownloaded(false);
    } finally {
      setIsChecking(false);
    }
  }, [trackId]);

  useEffect(() => {
    checkDownloaded();
  }, [checkDownloaded]);

  return { isDownloaded, isChecking, refetch: checkDownloaded };
};

/**
 * Hook to download a track
 */
export const useDownloadTrack = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const downloadTrack = useCallback(async (track: Track) => {
    setIsDownloading(true);
    setProgress(0);

    try {
      // Get the streaming URL from backend first
      let audioUrl: string;

      try {
        const streamResponse = await AudioService.getStreamUrl(track.id);
        audioUrl = streamResponse.url;
      } catch (streamError) {
        console.warn('Failed to get stream URL, trying track audioUrl:', streamError);

        // Fallback to track's audioUrl if available
        if (track.audioUrl && !track.audioUrl.includes('soundhelix')) {
          audioUrl = track.audioUrl;
        } else {
          throw new Error('لا يمكن تنزيل هذا المقطع حالياً. يرجى المحاولة لاحقاً');
        }
      }

      await downloadService.downloadTrack(track, audioUrl);
      setProgress(100);

      toast({
        title: 'تم التنزيل بنجاح',
        description: `تم تنزيل "${track.title}" للاستماع دون اتصال`,
      });

      return true;
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تنزيل المقطع';

      toast({
        title: 'فشل التنزيل',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [toast]);

  return { downloadTrack, isDownloading, progress };
};

/**
 * Hook to delete a downloaded track
 */
export const useDeleteDownload = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteDownload = useCallback(async (trackId: string, trackTitle?: string) => {
    setIsDeleting(true);

    try {
      await downloadService.deleteTrack(trackId);

      toast({
        title: 'تم الحذف بنجاح',
        description: trackTitle ? `تم حذف "${trackTitle}"` : 'تم حذف المقطع',
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'فشل الحذف',
        description: 'حدث خطأ أثناء حذف المقطع',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  return { deleteDownload, isDeleting };
};

/**
 * Hook to get all downloaded tracks
 */
export const useDownloadedTracks = () => {
  const [tracks, setTracks] = useState<Array<{ id: string; track: Track; downloadedAt: Date; size: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDownloadedTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const downloaded = await downloadService.getDownloadedTracks();
      setTracks(downloaded);
    } catch (error) {
      console.error('Error fetching downloaded tracks:', error);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloadedTracks();
  }, [fetchDownloadedTracks]);

  return { tracks, isLoading, refetch: fetchDownloadedTracks };
};

/**
 * Hook to get storage info
 */
export const useStorageInfo = () => {
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStorageInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const used = await downloadService.getStorageUsed();
      setStorageUsed(used);
    } catch (error) {
      console.error('Error fetching storage info:', error);
      setStorageUsed(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageInfo();
  }, [fetchStorageInfo]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return { storageUsed, storageUsedFormatted: formatSize(storageUsed), isLoading, refetch: fetchStorageInfo };
};
