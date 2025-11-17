/**
 * ProgramDetails Page
 * Detailed view of a program with track list and play functionality
 */

import { useState, useEffect } from "react";
import { ArrowRight, Heart, MoreVertical, Play, Check, Plus, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useProgramById, useProgramTracks } from "@/hooks/queries/usePrograms";
import { canAccessContent, getUserSubscriptionType } from "@/lib/contentAccess";
import {
  useEnrollInProgram,
  useProgramProgress,
  useEnrolledPrograms,
  useMarkTrackComplete,
  useCustomProgramById,
} from "@/hooks/queries/useUserPrograms";
import { useCurrentSubscription } from "@/hooks/queries/useSubscription";
import { ListItemSkeleton } from "@/components/LoadingSkeleton";

const ProgramDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, isPlaying, currentTrack } = useAudioPlayer();
  const { isProgramFavorite, toggleProgramFavorite } = useFavorites();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Check if it's a custom program based on query param
  const isCustomProgram = searchParams.get('type') === 'custom';

  // Fetch from appropriate endpoint based on program type
  const { data: regularProgram, isLoading: regularLoading, isError: regularError } = useProgramById(id || "", { enabled: !isCustomProgram && !!id });
  const { data: customProgram, isLoading: customLoading, isError: customError } = useCustomProgramById(id || "", { enabled: isCustomProgram && !!id });

  // Use the appropriate program data
  const program = isCustomProgram ? customProgram : regularProgram;
  const programLoading = isCustomProgram ? customLoading : regularLoading;
  const programError = isCustomProgram ? customError : regularError;

  // For regular programs, fetch tracks separately. For custom programs, tracks are included
  const { data: fetchedTracks, isLoading: tracksLoading, isError: tracksError } = useProgramTracks(id || "", { enabled: !isCustomProgram && !!id });

  // Use tracks from custom program if available, otherwise use fetched tracks
  const allTracks = isCustomProgram && customProgram?.tracks ? customProgram.tracks : fetchedTracks;

  const { data: enrolledPrograms } = useEnrolledPrograms();
  const enrollMutation = useEnrollInProgram();
  const markCompleteMutation = useMarkTrackComplete();

  const isFavorite = program ? isProgramFavorite(program.id) : false;
  const isEnrolled = enrolledPrograms?.some(p => p.id === id) || false;

  const { data: programProgress } = useProgramProgress(id || "", {
    enabled: isEnrolled && !!id,
  });

  // Get program display values with fallbacks for custom programs
  const programTitle = program?.title || ('name' in (program || {}) ? (program as { name: string }).name : '');
  const programThumbnail = program?.thumbnailUrl || allTracks?.[0]?.imageUrl || '';
  // Category can be either a string or an object (when populated)
  const programCategory = typeof program?.category === 'string'
    ? program.category
    : (program?.category as any)?.name || 'مسار خاص';
  const programLevel = program?.level || '';

  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useCurrentSubscription();

  // Check if user has access to this content
  // Wait for subscription to load before determining access
  const userSubscriptionType = subscriptionData?.packageId?.type || 'free';
  const contentAccess = program?.contentAccess || (program?.isPremium ? 'premium' : 'free');
  const hasAccess = canAccessContent(contentAccess, userSubscriptionType);

  // Redirect to subscription page if user doesn't have access
  // IMPORTANT: Wait for subscription to finish loading before redirecting
  useEffect(() => {
    if (program && !subscriptionLoading && !hasAccess) {
      navigate('/subscription');
    }
  }, [program, subscriptionLoading, hasAccess, navigate]);

  const handleEnroll = () => {
    if (!id) return;

    enrollMutation.mutate(id, {
      onSuccess: () => {
        setShowAddDialog(true);
        toast({
          title: "تم التسجيل بنجاح",
          description: "تم إضافة المسار إلى برامجي",
        });
      },
      onError: () => {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء التسجيل في المسار",
          variant: "destructive",
        });
      },
    });
  };

  if (programLoading || tracksLoading) {
    return (
      <div className="min-h-screen bg-background pb-6" dir="rtl">
        <div className="px-5 py-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (programError || tracksError || !program) {
    return (
      <div className="min-h-screen bg-background pb-6 flex items-center justify-center" dir="rtl">
        <div className="text-center px-5">
          <p className="text-destructive text-lg mb-4">
            {programError || tracksError ? "حدث خطأ في تحميل المسار" : "المسار غير موجود"}
          </p>
          <Button onClick={() => navigate(-1)} className="bg-primary text-white">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const handlePlayTrack = (trackId: string) => {
    if (!allTracks) return;
    const track = allTracks.find(t => t.id === trackId);
    if (track) {
      playTrack(track, allTracks, id);
      navigate(`/player/${trackId}`);
    }
  };

  const handleMarkTrackComplete = (trackId: string) => {
    if (!id || !isEnrolled) return;

    markCompleteMutation.mutate(
      { programId: id, trackId },
      {
        onSuccess: () => {
          toast({
            title: "تم الإكمال",
            description: "تم تحديث تقدمك في البرنامج",
          });
        },
        onError: () => {
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء تحديث التقدم",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header Image */}
      <div className="relative h-[350px]">
        <img
          src={programThumbnail}
          alt={programTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => program && toggleProgramFavorite(program.id, isFavorite)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Heart className={cn("w-4.5 h-4.5 text-white", isFavorite && "fill-white")} />
              </button>
              <button className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <MoreVertical className="w-4.5 h-4.5 text-white" />
              </button>
            </div>
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Program Info */}
      <div className="px-5 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3 mb-4">
            {/* Play All Button */}
            <Button
              onClick={() => {
                if (allTracks && allTracks.length > 0) {
                  playTrack(allTracks[0], allTracks, id);
                  navigate(`/player/${allTracks[0].id}`);
                }
              }}
              disabled={!allTracks || allTracks.length === 0}
              className="flex-1 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
            >
              <Play className="w-5 h-5 ml-2" />
              تشغيل الكل
            </Button>

            {/* Add to My Programs Button */}
            {isEnrolled ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">مسجل</span>
              </div>
            ) : (
              <Button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
                className="flex-1 bg-white border-2 border-primary text-primary rounded-full shadow-lg hover:bg-primary/5"
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة لمساراتي
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Title and Category */}
          <div className="text-right space-y-2 mb-6">
            <h1 className="text-2xl font-bold">{programTitle}</h1>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-primary font-medium">{programCategory}</span>
              {programLevel && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-sm">{programLevel}</span>
                </>
              )}
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-0 divide-y">
            {allTracks && allTracks.map((track, index) => {
              const isCompleted = programProgress?.completedTracks.includes(track.id) || false;
              const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

              return (
                <div
                  key={track.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-full flex items-center gap-4">
                    <button
                      onClick={() => handlePlayTrack(track.id)}
                      className="flex-1 flex items-center gap-4 hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors"
                    >
                      {/* Play/Pause Icon */}
                      <div className="w-7 h-7 shrink-0">
                        {isCurrentlyPlaying ? (
                          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <div className="flex gap-1">
                              <div className="w-1 h-3 bg-white rounded" />
                              <div className="w-1 h-3 bg-white rounded" />
                            </div>
                          </div>
                        ) : (
                          <Play className="w-6 h-6 text-gray-400" fill="currentColor" />
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 text-right space-y-1">
                        <div className="flex items-center justify-end gap-2">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{track.title}</p>
                            <p className="text-xs text-muted-foreground">{track.duration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Track Number */}
                      <div className="text-xl font-bold text-gray-300 w-8 text-center shrink-0">
                        {index + 1}
                      </div>
                    </button>

                    {/* Completion Check/Button */}
                    {isEnrolled && (
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkTrackComplete(track.id)}
                            disabled={markCompleteMutation.isPending}
                            className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary transition-colors"
                            title="وضع علامة كمكتمل"
                          >
                            {markCompleteMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            ) : null}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add to Program Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تمت اضافة {programTitle} بنجاح</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowAddDialog(false);
                navigate("/my-programs");
              }}
              className="flex-1 bg-primary text-white rounded-full"
            >
              عرض مساراتي
            </Button>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="flex-1 rounded-full"
            >
              متابعة التصفح
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramDetails;

