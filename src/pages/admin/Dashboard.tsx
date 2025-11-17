/**
 * Admin Dashboard Page
 * Comprehensive dashboard with real API data
 * Liquid Glass design with Arabic RTL support and app colors
 */

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Music,
  ListVideo,
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsService, DashboardMetrics } from '@/lib/api/services/admin';
import MetricCard from '@/components/admin/MetricCard';
import RevenueChart from '@/components/admin/RevenueChart';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import PopularContentList from '@/components/admin/PopularContentList';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();

  const {
    data: metrics,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const data = await AnalyticsService.getDashboardMetrics();
      console.log('Dashboard Metrics - API Response:', data);
      console.log('Dashboard Metrics - Monthly Revenue:', data.monthlyRevenue);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const formatLastUpdated = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#4091A5] mx-auto mb-4" />
          <p className="text-slate-600" style={{ fontFamily: 'Tajawal' }}>
            جاري تحميل لوحة التحكم...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-8">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Tajawal' }}>
              فشل في تحميل البيانات
            </h2>
            <p className="text-slate-600 mb-6" style={{ fontFamily: 'Tajawal' }}>
              حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-[#4091A5] to-[#535353] hover:from-[#357a8a] hover:to-[#424242]"
              style={{ fontFamily: 'Tajawal' }}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-slate-50 -z-10" />

      <div className="space-y-8">
        {/* Welcome Header with Glass Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
          <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1
                  className="text-4xl font-bold bg-gradient-to-r from-[#4091A5] to-[#535353] bg-clip-text text-transparent mb-2"
                  style={{ fontFamily: 'Tajawal' }}
                >
                  مرحباً، {user?.name || 'المسؤول'}
                </h1>
                <p className="text-slate-600 text-lg" style={{ fontFamily: 'Tajawal' }}>
                  نظرة عامة على إحصائيات لوحة التحكم
                </p>
                {dataUpdatedAt && (
                  <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Tajawal' }}>
                    آخر تحديث: {formatLastUpdated(dataUpdatedAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="bg-white/50 hover:bg-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
                <div className="bg-gradient-to-br from-[#4091A5] to-[#535353] p-4 rounded-2xl shadow-xl">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Glassmorphism - Improved Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="إجمالي المستخدمين"
            value={metrics?.totalUsers || 0}
            icon={Users}
            trend={metrics?.trends?.users ? (metrics.trends.users > 0 ? 'up' : 'down') : undefined}
            changePercentage={metrics?.trends?.users}
            gradient="from-[#4091A5] to-[#535353]"
          />
          <MetricCard
            title="المستخدمون النشطون"
            value={metrics?.activeUsers || 0}
            icon={Users}
            gradient="from-cyan-500 to-teal-600"
            subtitle="آخر 30 يوم"
          />
          <MetricCard
            title="المقاطع الصوتية"
            value={metrics?.totalTracks || 0}
            icon={Music}
            gradient="from-[#4091A5] to-cyan-500"
          />
          <MetricCard
            title="البرامج"
            value={metrics?.totalPrograms || 0}
            icon={ListVideo}
            gradient="from-[#535353] to-slate-600"
          />
          <MetricCard
            title="الاشتراكات النشطة"
            value={metrics?.activeSubscriptions || 0}
            icon={CreditCard}
            trend={
              metrics?.trends?.subscriptions
                ? metrics.trends.subscriptions > 0
                  ? 'up'
                  : 'down'
                : undefined
            }
            changePercentage={metrics?.trends?.subscriptions}
            gradient="from-[#4091A5] to-teal-600"
          />
          <MetricCard
            title="الإيرادات الشهرية"
            value={metrics?.monthlyRevenue || 0}
            icon={DollarSign}
            trend={metrics?.trends?.revenue ? (metrics.trends.revenue > 0 ? 'up' : 'down') : undefined}
            changePercentage={metrics?.trends?.revenue}
            gradient="from-green-500 to-emerald-600"
            format="currency"
          />
        </div>

        {/* Revenue Chart */}
        <RevenueChart />

        {/* Recent Activity Section */}
        <div className="relative mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Tajawal' }}>
            النشاط الأخير
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentUsersTable />
          <PopularContentList />
        </div>

        {/* Quick Actions */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
          <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Tajawal' }}>
              إجراءات سريعة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'إدارة المستخدمين', icon: Users, path: '/admin/users' },
                { label: 'إدارة المقاطع', icon: Music, path: '/admin/tracks' },
                { label: 'إدارة البرامج', icon: ListVideo, path: '/admin/programs' },
                { label: 'عرض التحليلات', icon: TrendingUp, path: '/admin/analytics' },
              ].map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => (window.location.href = action.path)}
                    className="group/btn relative overflow-hidden bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-gradient-to-br from-[#4091A5] to-[#535353] p-3 rounded-lg">
                        <ActionIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                        {action.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
