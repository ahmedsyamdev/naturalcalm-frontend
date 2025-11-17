import { useNavigate } from "react-router-dom";
import { Bell, Heart, Search } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import BottomNav from "@/components/BottomNav";
import CategoryCard from "@/components/CategoryCard";
import ProgramCard from "@/components/ProgramCard";
import TrackCard from "@/components/TrackCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/queries/useCategories";
import { useFeaturedPrograms } from "@/hooks/queries/usePrograms";
import { useTracks } from "@/hooks/queries/useTracks";
import { useRecentTracks } from "@/hooks/queries/useStats";
import { useUnreadCount } from "@/hooks/queries/useNotifications";
import { CategoryCardSkeleton, ProgramCardSkeleton, TrackCardSkeleton } from "@/components/LoadingSkeleton";
import { NotificationPermissionDialog } from "@/components/NotificationPermissionDialog";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoriteTrackIds } = useFavorites();

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const { data: featuredProgramsData, isLoading: programsLoading, isError: programsError } = useFeaturedPrograms();
  const { data: tracksData, isLoading: tracksLoading, isError: tracksError } = useTracks();
  const { data: recentTracksData, isLoading: recentTracksLoading, isError: recentTracksError } = useRecentTracks();
  const { data: unreadCount = 0 } = useUnreadCount();

  const featuredPrograms = featuredProgramsData?.slice(0, 5) || [];
  const recentTracks = recentTracksData || [];
  const favoritesTracks = tracksData?.filter(track => favoriteTrackIds.includes(track.id)).slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-b-[2.5rem] px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/favorites")}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Heart className="w-4.5 h-4.5 text-white" />
            </button>
            <div className="relative">
              <button
                onClick={() => navigate("/notifications")}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Bell className="w-4.5 h-4.5 text-white" />
              </button>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-white text-xl font-bold">اهلا بك {user?.name}!</h1>
            <p className="text-white/90 text-sm">استعد لتجديد طاقتك وتهدئة عقلك...</p>
          </div>
        </div>

        {/* Search Bar */}
        <button 
          onClick={() => navigate("/search")}
          className="w-full"
        >
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 h-12 bg-white rounded-2xl flex items-center px-4 shadow-md">
              <span className="text-gray-400 text-sm mr-auto">البحث</span>
            </div>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="py-6 space-y-6">
        {/* Categories - Full width slider */}
        <div className="w-full">
          {categoriesLoading ? (
            <div className="flex gap-2.5 px-5 overflow-x-auto">
              {[...Array(5)].map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="px-5 text-center py-4">
              <p className="text-destructive text-sm mb-2">حدث خطأ في تحميل الفئات</p>
              <button className="text-primary text-sm font-medium" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>
            </div>
          ) : categories && categories.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={10}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              className="!px-5"
            >
              {categories.map((category) => (
                <SwiperSlide key={category.id} className="!w-[70px]">
                  <CategoryCard
                    icon={category.icon}
                    label={category.name}
                    color={category.color}
                    onClick={() => navigate(`/category/${category.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="px-5 text-center py-4 text-muted-foreground text-sm">
              لا توجد فئات متاحة حالياً
            </div>
          )}
        </div>

        {/* Featured Programs Section - Offset Left */}
        <div>
          <div className="flex justify-between items-center mb-4 px-5">
            <h2 className="text-lg font-bold">المسارات المميزة</h2>
            <button className="text-primary text-sm font-medium">الكل</button>
          </div>
          {programsLoading ? (
            <div className="flex gap-3 px-5 overflow-x-auto">
              {[...Array(3)].map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))}
            </div>
          ) : programsError ? (
            <div className="px-5 text-center py-4">
              <p className="text-destructive text-sm mb-2">حدث خطأ في تحميل المسارات</p>
              <button className="text-primary text-sm font-medium" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>
            </div>
          ) : featuredPrograms.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={12}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {featuredPrograms.map((program, index) => (
                <SwiperSlide key={`${program.id}-${index}`} className="!w-[220px]">
                  <ProgramCard
                    program={program}
                    size="large"
                    onClick={() => navigate(`/program/${program.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="px-5 text-center py-4 text-muted-foreground text-sm">
              لا توجد مسارات مميزة حالياً
            </div>
          )}
        </div>

        {/* Recent Views Section - Offset Left */}
        <div>
          <div className="flex justify-between items-center mb-4 px-5">
            <h2 className="text-lg font-bold">اخر المشاهدات</h2>
            <button className="text-primary text-sm font-medium">الكل</button>
          </div>
          {recentTracksLoading ? (
            <div className="flex gap-3 px-5 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <TrackCardSkeleton key={i} />
              ))}
            </div>
          ) : recentTracksError ? (
            <div className="px-5 text-center py-4">
              <p className="text-destructive text-sm mb-2">حدث خطأ في تحميل المسارات</p>
              <button className="text-primary text-sm font-medium" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>
            </div>
          ) : recentTracks.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={12}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {recentTracks.map((track, index) => (
                <SwiperSlide key={`${track.id}-${index}`} className="!w-[170px]">
                  <TrackCard
                    track={track}
                    onClick={() => navigate(`/player/${track.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="px-5 text-center py-4 text-muted-foreground text-sm">
              لا توجد مشاهدات حديثة
            </div>
          )}
        </div>

        {/* Favorites Section - Offset Left */}
        <div>
          <div className="flex justify-between items-center mb-4 px-5">
            <h2 className="text-lg font-bold">اخر المفضلات</h2>
            <button
              onClick={() => navigate("/favorites")}
              className="text-primary text-sm font-medium"
            >
              الكل
            </button>
            
          </div>
          {tracksLoading ? (
            <div className="flex gap-3 px-5 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <TrackCardSkeleton key={i} />
              ))}
            </div>
          ) : favoritesTracks.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={12}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {favoritesTracks.map((track, index) => (
                <SwiperSlide key={`${track.id}-fav-${index}`} className="!w-[170px]">
                  <TrackCard
                    track={track}
                    onClick={() => navigate(`/player/${track.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="px-5 text-center py-4 text-muted-foreground text-sm">
              لا توجد مفضلات بعد
            </div>
          )}
        </div>
      </div>

      {/* Notification Permission Dialog */}
      <NotificationPermissionDialog autoShow={true} showDelay={5000} />

      <BottomNav />
    </div>
  );
};

export default Home;
