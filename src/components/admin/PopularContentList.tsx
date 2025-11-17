/**
 * PopularContentList Component
 * Displays popular tracks in a list format
 * Arabic RTL with Liquid Glass design
 */

import { useQuery } from '@tanstack/react-query';
import { Music, ExternalLink, Loader2, AlertCircle, Play } from 'lucide-react';
import { AnalyticsService, PopularTrack } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PopularContentList() {
  const navigate = useNavigate();

  const {
    data: popularTracks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PopularTrack[]>({
    queryKey: ['popularTracks'],
    queryFn: () => AnalyticsService.getPopularTracks(5),
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="relative group" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#4091A5] mx-auto mb-3" />
              <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                جاري تحميل المحتوى الشائع...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const is404 = error && (error as any)?.response?.status === 404;

    return (
      <div className="relative group" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl" />
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Music className="h-12 w-12 text-orange-500 mb-3" />
            <p className="text-slate-700 mb-2 text-center font-semibold" style={{ fontFamily: 'Tajawal' }}>
              {is404 ? 'الميزة قيد التطوير' : 'فشل في تحميل المحتوى الشائع'}
            </p>
            <p className="text-sm text-slate-600 mb-4 text-center" style={{ fontFamily: 'Tajawal' }}>
              {is404
                ? 'سيتم إضافة هذه الميزة قريباً في النسخة القادمة'
                : 'حدث خطأ أثناء تحميل البيانات'}
            </p>
            {!is404 && (
              <Button
                onClick={() => refetch()}
                className="bg-[#4091A5] hover:bg-[#357a8a]"
                style={{ fontFamily: 'Tajawal' }}
              >
                إعادة المحاولة
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#4091A5] to-[#535353] p-2 rounded-lg">
              <Music className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
              المحتوى الأكثر شعبية
            </h2>
          </div>
          <button
            onClick={() => navigate('/admin/tracks')}
            className="flex items-center gap-2 text-sm text-[#4091A5] hover:text-[#357a8a] transition-colors"
            style={{ fontFamily: 'Tajawal' }}
          >
            عرض الكل
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        {popularTracks && popularTracks.length > 0 ? (
          <div className="space-y-3">
            {popularTracks.map((track, index) => (
              <div
                key={track.id}
                className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  index < 3
                    ? 'bg-gradient-to-r hover:scale-[1.02] transform'
                    : 'bg-white/30 hover:bg-white/50'
                } ${
                  index === 0
                    ? 'from-[#4091A5]/5 via-white/40 to-white/40 border-l-[3px] border-l-[#4091A5] shadow-lg'
                    : index === 1
                    ? 'from-[#535353]/5 via-white/40 to-white/40 border-l-[3px] border-l-[#535353] shadow-md'
                    : index === 2
                    ? 'from-[#4091A5]/3 via-white/40 to-white/40 border-l-[3px] border-l-[#4091A5]/60 shadow-md'
                    : 'border border-slate-100 hover:border-[#4091A5]/30'
                }`}
              >
                {/* Animated accent bar for top 3 */}
                {index < 3 && (
                  <div
                    className={`absolute left-0 top-0 w-1 h-full rounded-l-xl transition-all duration-700 group-hover:w-2 ${
                      index === 0
                        ? 'bg-gradient-to-b from-[#4091A5] to-[#357a8a]'
                        : index === 1
                        ? 'bg-gradient-to-b from-[#535353] to-[#3a3a3a]'
                        : 'bg-gradient-to-b from-[#4091A5] to-[#535353]'
                    }`}
                  />
                )}

                {/* Rank number with modern design */}
                <div className="flex-shrink-0 relative z-20">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                      index === 0
                        ? 'bg-[#4091A5] text-white shadow-lg shadow-[#4091A5]/30'
                        : index === 1
                        ? 'bg-[#535353] text-white shadow-lg shadow-[#535353]/30'
                        : index === 2
                        ? 'bg-gradient-to-br from-[#4091A5] to-[#535353] text-white shadow-md'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Image */}
                {track.imageUrl && (
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-semibold text-slate-900 truncate text-right"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    {track.title}
                  </h3>
                  <p
                    className="text-xs text-slate-600 text-right"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    {track.category}
                  </p>
                </div>

                {/* Play Count */}
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4091A5]/10">
                  <Play className="h-4 w-4 text-[#4091A5]" />
                  <span
                    className="text-sm font-semibold text-[#4091A5]"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    {track.playCount.toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
              لا يوجد محتوى شائع
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
