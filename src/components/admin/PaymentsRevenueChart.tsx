/**
 * Payments Revenue Chart Component
 * Chart displaying revenue over time with date range filters
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSubscriptionService } from '@/lib/api/services/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

export function RevenueChart() {
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  }>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'day',
  });

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-data', filters],
    queryFn: async () => {
      const data = await AdminSubscriptionService.getRevenueData(filters);
      console.log('PaymentsRevenueChart - API Response:', data);
      console.log('PaymentsRevenueChart - Filters:', filters);
      return data;
    },
  });

  const handleQuickFilter = (days: number) => {
    setFilters({
      ...filters,
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), filters.groupBy === 'day' ? 'dd/MM' : 'dd/MM/yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/60" dir="rtl">
          <p className="text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Tajawal' }}>
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="text-sm text-green-600" style={{ fontFamily: 'Tajawal' }}>
            الإيرادات: {payload[0].value.toLocaleString('ar-EG')} ر.س
          </p>
          <p className="text-sm text-blue-600" style={{ fontFamily: 'Tajawal' }}>
            الاشتراكات: {payload[1].value.toLocaleString('ar-EG')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ fontFamily: 'Tajawal' }}>الإيرادات عبر الزمن</CardTitle>
            <CardDescription style={{ fontFamily: 'Tajawal' }}>
              تتبع الإيرادات والاشتراكات الجديدة
            </CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3" dir="rtl">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
          />
          <Select
            value={filters.groupBy}
            onValueChange={(value: 'day' | 'week' | 'month') =>
              setFilters({ ...filters, groupBy: value })
            }
          >
            <SelectTrigger className="bg-white/60" style={{ fontFamily: 'Tajawal' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="day" style={{ fontFamily: 'Tajawal' }}>
                يومي
              </SelectItem>
              <SelectItem value="week" style={{ fontFamily: 'Tajawal' }}>
                أسبوعي
              </SelectItem>
              <SelectItem value="month" style={{ fontFamily: 'Tajawal' }}>
                شهري
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(7)}
              className="bg-white/60 flex-1"
              style={{ fontFamily: 'Tajawal' }}
            >
              7 أيام
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(30)}
              className="bg-white/60 flex-1"
              style={{ fontFamily: 'Tajawal' }}
            >
              30 يوم
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-full h-full" />
            </div>
          ) : revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  style={{ fontFamily: 'Tajawal', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis style={{ fontFamily: 'Tajawal', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 14 }}
                  iconType="circle"
                  formatter={(value) => {
                    if (value === 'revenue') return 'الإيرادات (ر.س)';
                    if (value === 'subscriptions') return 'الاشتراكات';
                    return value;
                  }}
                />
                <Bar dataKey="revenue" fill="#4091A5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="subscriptions" fill="#535353" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500" style={{ fontFamily: 'Tajawal' }}>
              لا توجد بيانات لعرضها
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
