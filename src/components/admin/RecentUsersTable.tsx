/**
 * RecentUsersTable Component
 * Displays recent users in a table format
 * Arabic RTL with Liquid Glass design
 */

import { useQuery } from '@tanstack/react-query';
import { Users, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { AnalyticsService, RecentUser } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function RecentUsersTable() {
  const navigate = useNavigate();

  const {
    data: recentUsers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<RecentUser[]>({
    queryKey: ['recentUsers'],
    queryFn: () => AnalyticsService.getRecentUsers(5),
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSubscriptionBadge = (subscription?: { type: string; status: string }) => {
    if (!subscription || subscription.status !== 'active') {
      return (
        <span
          className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600"
          style={{ fontFamily: 'Tajawal' }}
        >
          بدون اشتراك
        </span>
      );
    }

    const typeColors: Record<string, string> = {
      premium: 'bg-yellow-100 text-yellow-700',
      standard: 'bg-blue-100 text-blue-700',
      basic: 'bg-green-100 text-green-700',
    };

    const typeLabels: Record<string, string> = {
      premium: 'بريميوم',
      standard: 'قياسي',
      basic: 'أساسي',
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-lg ${
          typeColors[subscription.type] || 'bg-slate-100 text-slate-600'
        }`}
        style={{ fontFamily: 'Tajawal' }}
      >
        {typeLabels[subscription.type] || subscription.type}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="relative group" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#4091A5] mx-auto mb-3" />
              <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                جاري تحميل المستخدمين...
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
            <Users className="h-12 w-12 text-orange-500 mb-3" />
            <p className="text-slate-700 mb-2 text-center font-semibold" style={{ fontFamily: 'Tajawal' }}>
              {is404 ? 'الميزة قيد التطوير' : 'فشل في تحميل المستخدمين'}
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
              المستخدمون الجدد
            </h2>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-sm text-[#4091A5] hover:text-[#357a8a] transition-colors"
            style={{ fontFamily: 'Tajawal' }}
          >
            عرض الكل
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        {recentUsers && recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th
                    className="text-right py-3 px-2 text-sm font-semibold text-slate-700"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    الاسم
                  </th>
                  <th
                    className="text-right py-3 px-2 text-sm font-semibold text-slate-700"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    رقم الهاتف
                  </th>
                  <th
                    className="text-right py-3 px-2 text-sm font-semibold text-slate-700"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    الاشتراك
                  </th>
                  <th
                    className="text-right py-3 px-2 text-sm font-semibold text-slate-700"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    تاريخ التسجيل
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-white/30 transition-colors"
                  >
                    <td
                      className="py-3 px-2 text-sm text-slate-900"
                      style={{ fontFamily: 'Tajawal' }}
                    >
                      {user.name}
                    </td>
                    <td
                      className="py-3 px-2 text-sm text-slate-600 text-left"
                      style={{ fontFamily: 'Tajawal', direction: 'ltr' }}
                    >
                      {user.phone}
                    </td>
                    <td className="py-3 px-2">{getSubscriptionBadge(user.subscription)}</td>
                    <td
                      className="py-3 px-2 text-sm text-slate-600"
                      style={{ fontFamily: 'Tajawal' }}
                    >
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
              لا يوجد مستخدمون جدد
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
