/**
 * Coupon Stats Dialog Component
 * Dialog showing detailed statistics for a coupon
 */

import { useQuery } from '@tanstack/react-query';
import { AdminSubscriptionService } from '@/lib/api/services/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CouponStatsDialogProps {
  couponId: string;
  couponCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponStatsDialog({
  couponId,
  couponCode,
  open,
  onOpenChange,
}: CouponStatsDialogProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['coupon-stats', couponId],
    queryFn: () => AdminSubscriptionService.getCouponStats(couponId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Tajawal' }}>إحصائيات الكوبون</DialogTitle>
          <DialogDescription style={{ fontFamily: 'Tajawal' }}>
            تفاصيل الاستخدام للكوبون: <span className="font-mono font-semibold">{couponCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/40 backdrop-blur-md border-white/60">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : stats ? (
              <>
                <Card className="bg-white/40 backdrop-blur-md border-white/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                        إجمالي الاستخدام
                      </CardTitle>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                      {stats.totalUses.toLocaleString('ar-EG')}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border-white/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                        إجمالي الخصم
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                      {stats.totalDiscountGiven.toLocaleString('ar-EG')} ر.س
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border-white/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                        معدل النجاح
                      </CardTitle>
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                      {stats.successRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Users Table */}
          <Card className="bg-white/40 backdrop-blur-md border-white/60">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Tajawal' }}>المستخدمون</CardTitle>
              <CardDescription style={{ fontFamily: 'Tajawal' }}>
                قائمة المستخدمين الذين استخدموا هذا الكوبون
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats && stats.users.length > 0 ? (
                <div className="rounded-lg border border-white/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/60 hover:bg-white/20">
                        <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                          المستخدم
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                          تاريخ الاستخدام
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold text-left" style={{ fontFamily: 'Tajawal' }}>
                          قيمة الخصم
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.users.map((user) => (
                        <TableRow key={user.id} className="border-white/60 hover:bg-white/30">
                          <TableCell className="font-medium" style={{ fontFamily: 'Tajawal' }}>
                            {user.name}
                          </TableCell>
                          <TableCell style={{ fontFamily: 'Tajawal' }}>
                            {format(new Date(user.usedAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-left font-semibold" style={{ fontFamily: 'Tajawal' }}>
                            {user.discountAmount.toLocaleString('ar-EG')} ر.س
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                  لم يستخدم أحد هذا الكوبون بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
