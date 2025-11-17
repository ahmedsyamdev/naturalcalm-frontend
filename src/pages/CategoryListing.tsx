import { Bell, Heart, ArrowRight, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import TrackCard from "@/components/TrackCard";
import ProgramCard from "@/components/ProgramCard";
import { useCategoryById } from "@/hooks/queries/useCategories";
import { useTracksByCategory } from "@/hooks/queries/useTracks";
import { useProgramsByCategory } from "@/hooks/queries/usePrograms";
import { TrackCardSkeleton, ProgramCardSkeleton } from "@/components/LoadingSkeleton";

const CategoryListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: category, isLoading: categoryLoading, isError: categoryError } = useCategoryById(id || "");
  const { data: categoryTracks, isLoading: tracksLoading, isError: tracksError } = useTracksByCategory(id || "");
  const { data: categoryPrograms, isLoading: programsLoading, isError: programsError } = useProgramsByCategory(id || "");

  const categoryName = category?.name || "الفئة";

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/favorites")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Heart className="w-4.5 h-4.5 text-primary" />
            </button>
            <button 
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-primary" />
            </button>
          </div>
          
          <h1 className="text-xl font-bold flex-1 text-center">{categoryName}</h1>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/search")}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>
            <Input
              type="text"
              placeholder="البحث"
              className="flex-1 h-12 rounded-2xl text-right border"
              onClick={() => navigate("/search")}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-8">
        {/* Featured Programs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <button className="text-primary text-sm font-medium">الكل</button>
            <h2 className="text-lg font-bold">المسارات المميزة</h2>
          </div>
          {programsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))}
            </div>
          ) : programsError ? (
            <div className="text-center py-8">
              <p className="text-destructive text-sm mb-2">حدث خطأ في تحميل المسارات</p>
              <button className="text-primary text-sm font-medium" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>
            </div>
          ) : categoryPrograms && categoryPrograms.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {categoryPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onClick={() => navigate(`/program/${program.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              لا توجد مسارات في هذه الفئة
            </div>
          )}
        </div>

        {/* Most Listened Tracks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <button className="text-primary text-sm font-medium">الكل</button>
            <h2 className="text-lg font-bold">الاكثر استماعا</h2>
          </div>
          {tracksLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <TrackCardSkeleton key={i} />
              ))}
            </div>
          ) : tracksError ? (
            <div className="text-center py-8">
              <p className="text-destructive text-sm mb-2">حدث خطأ في تحميل المقاطع</p>
              <button className="text-primary text-sm font-medium" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>
            </div>
          ) : categoryTracks && categoryTracks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {categoryTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onClick={() => navigate(`/player/${track.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              لا توجد مقاطع في هذه الفئة
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CategoryListing;
