/**
 * RevenueChart Component
 * Displays revenue over time using Recharts
 * Arabic RTL with Liquid Glass design
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { AnalyticsService, RevenueData } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';

type Period = 'week' | 'month' | 'year';

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>('month');

  const {
    data: revenueData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<RevenueData[]>({
    queryKey: ['revenue', period],
    queryFn: async () => {
      const data = await AnalyticsService.getRevenue(period);
      console.log('Dashboard RevenueChart - API Response:', data);
      console.log('Dashboard RevenueChart - Period:', period);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });

  const periodLabels: Record<Period, string> = {
    week: 'آخر أسبوع',
    month: 'آخر شهر',
    year: 'آخر سنة',
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
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
                جاري تحميل بيانات الإيرادات...
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
            <TrendingUp className="h-12 w-12 text-orange-500 mb-3" />
            <p className="text-slate-700 mb-2 text-center font-semibold" style={{ fontFamily: 'Tajawal' }}>
              {is404 ? 'الميزة قيد التطوير' : 'فشل في تحميل بيانات الإيرادات'}
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
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
              الإيرادات
            </h2>
          </div>
          <TrendingUp className="h-5 w-5 text-[#4091A5]" />
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6 justify-end">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-[#4091A5] to-[#535353] text-white shadow-md'
                  : 'bg-white/50 text-slate-600 hover:bg-white/80'
              }`}
              style={{ fontFamily: 'Tajawal' }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64">
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4091A5" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#535353" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  style={{ fontFamily: 'Tajawal', fontSize: '12px' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontFamily: 'Tajawal', fontSize: '12px' }}
                  tickFormatter={(value) => `${value.toLocaleString('ar-SA')} ر.س`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'Tajawal',
                    direction: 'rtl',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#revenueGradient)"
                  radius={[8, 8, 0, 0]}
                  name="الإيرادات"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                لا توجد بيانات متاحة
              </p>
            </div>
          )}
        </div>

        {/* Total Revenue Summary */}
        {revenueData && revenueData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                إجمالي الإيرادات
              </span>
              <span
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: 'Tajawal' }}
              >
                {formatCurrency(
                  revenueData.reduce((sum, item) => sum + item.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
