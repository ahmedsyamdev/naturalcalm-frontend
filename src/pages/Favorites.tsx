import { useState } from "react";
import { Bell, Heart, ArrowRight, Trash2, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ProgramCard from "@/components/ProgramCard";
import { CreateCustomProgramDialog } from "@/components/CreateCustomProgramDialog";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFavoriteTracks, useFavoritePrograms } from "@/hooks/queries/useFavorites";

const Favorites = () => {
  const navigate = useNavigate();
  const { toggleTrackFavorite } = useFavorites();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: favoriteTracks = [], isLoading: isLoadingTracks, error: tracksError } = useFavoriteTracks();
  const { data: favoritePrograms = [], isLoading: isLoadingPrograms, error: programsError } = useFavoritePrograms();

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-primary" />
            </button>
            <button 
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-primary" />
            </button>
          </div>
          
          <h1 className="text-xl font-bold flex-1 text-center">المفضلة</h1>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 space-y-6">
        {/* Categories to Add To - Swiper Slider */}
        <div>
          <h2 className="text-lg font-bold mb-4 px-5 text-right">اختر المسار الذي تريد الاضافة فيه</h2>

          {isLoadingPrograms ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : programsError ? (
            <div className="text-center py-8 px-5">
              <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل البرامج</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : favoritePrograms.length === 0 ? (
            <div className="text-center py-8 px-5">
              <p className="text-muted-foreground">لا توجد برامج في المفضلة</p>
            </div>
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={60}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {favoritePrograms.map((program) => (
                <SwiperSlide key={program.id} className="!w-[170px]">
                  <ProgramCard
                    program={program}
                    onClick={() => navigate(`/program/${program.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Favorite Tracks with Delete */}
        <div className="space-y-3 px-5">
          <div className="h-px bg-border" />

          {isLoadingTracks ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tracksError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل المقاطع</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : favoriteTracks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد مقاطع في المفضلة</p>
            </div>
          ) : (
            <>
              {favoriteTracks.slice(0, 4).map((track) => (
                <div
                  key={track.id}
                  className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3"
                >
                  <button
                    onClick={() => toggleTrackFavorite(track.id, true)}
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-right space-y-0.5">
                      <div className="inline-block bg-gray-100 px-2 py-0.5 rounded-full text-[10px] mb-1">
                        {track.level}
                      </div>
                      <p className="text-sm font-medium">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="h-px bg-border mt-4" />

          {/* Create Program from Favorites */}
          {favoriteTracks.length > 0 && (
            <div className="pt-4">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="w-full bg-primary text-white rounded-full h-12"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء مسار من المفضلة
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Program Dialog */}
      <CreateCustomProgramDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        availableTracks={favoriteTracks}
        preSelectedTrackIds={favoriteTracks.map((t) => t.id)}
      />

      <BottomNav />
    </div>
  );
};

export default Favorites;
