/**
 * Downloads Page
 * Manage downloaded tracks for offline listening
 */

import { ArrowRight, Trash2, Play, Pause, HardDrive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDownloadedTracks, useDeleteDownload, useStorageInfo } from "@/hooks/useDownload";
import { getImageUrl } from "@/lib/config";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Downloads = () => {
  const navigate = useNavigate();
  const { tracks, isLoading, refetch } = useDownloadedTracks();
  const { deleteDownload, isDeleting } = useDeleteDownload();
  const { storageUsed, storageUsedFormatted } = useStorageInfo();
  const { playTrack, pauseTrack, resumeTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = async () => {
    if (trackToDelete) {
      const success = await deleteDownload(trackToDelete.id, trackToDelete.title);
      if (success) {
        refetch();
      }
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  const handlePlayPauseTrack = (trackData: typeof tracks[0]) => {
    const isCurrentTrack = currentTrack?.id === trackData.track.id;

    if (isCurrentTrack) {
      // If this track is already playing, toggle play/pause
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      // Play this track
      playTrack(trackData.track, [trackData.track]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="w-9" />
            <h1 className="text-xl font-bold">التنزيلات</h1>
            <button onClick={() => navigate(-1)}>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Storage Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المساحة المستخدمة</p>
                <p className="text-lg font-bold text-primary">{storageUsedFormatted}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{tracks.length}</p>
              <p className="text-xs text-muted-foreground">مقطع منزّل</p>
            </div>
          </div>
        </div>

        {/* Downloaded Tracks */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-right">المقاطع المنزّلة</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">لا توجد تنزيلات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                قم بتنزيل المقاطع للاستماع إليها دون اتصال بالإنترنت
              </p>
              <Button onClick={() => navigate("/home")} className="bg-primary hover:bg-primary/90">
                تصفح المقاطع
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Track Image */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(item.track.imageUrl)}
                        alt={item.track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.track.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{item.track.duration}</span>
                        <span>•</span>
                        <span>{item.track.level}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.downloadedAt).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => handlePlayPauseTrack(item)}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          currentTrack?.id === item.track.id && isPlaying
                            ? "bg-primary text-white"
                            : "bg-primary/10 hover:bg-primary/20 text-primary"
                        )}
                      >
                        {currentTrack?.id === item.track.id && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setTrackToDelete({ id: item.id, title: item.track.title });
                          setDeleteDialogOpen(true);
                        }}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التنزيل</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{trackToDelete?.title}"؟ سيتم حذف الملف من جهازك ولن تتمكن من
              الاستماع إليه دون اتصال.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Downloads;
