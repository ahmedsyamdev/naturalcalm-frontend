/**
 * Admin Payments Management Page
 * Complete payment management with filters, details, refunds, and export
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSubscriptionService, type PaymentFilters } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Eye, ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Payment, PaymentStatus } from '@/types';
import { PaymentDetailsDialog } from '@/components/admin/PaymentDetailsDialog';
import { RevenueChart } from '@/components/admin/PaymentsRevenueChart';

export default function Payments() {
  const { toast } = useToast();

  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    paymentMethod: undefined,
    startDate: '',
    endDate: '',
  });

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: () => AdminSubscriptionService.getPayments(filters),
  });

  const updateFilters = (updates: Partial<PaymentFilters>) => {
    setFilters({ ...filters, ...updates, page: updates.page !== undefined ? updates.page : 1 });
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const blob = await AdminSubscriptionService.exportPayments(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'تم التصدير',
        description: 'تم تصدير البيانات بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تصدير البيانات',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: any; label: string }> = {
      completed: { variant: 'default', label: 'مكتمل' },
      pending: { variant: 'secondary', label: 'قيد الانتظار' },
      failed: { variant: 'destructive', label: 'فشل' },
      refunded: { variant: 'outline', label: 'مسترد' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={status === 'completed' ? 'bg-green-500' : ''} style={{ fontFamily: 'Tajawal' }}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      visa: 'فيزا',
      'apple-pay': 'Apple Pay',
    };
    return labels[method] || method;
  };

  const failedPayments = data?.data.filter((p) => p.status === 'failed') || [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
            إدارة المدفوعات
          </h1>
          <p className="text-slate-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            عرض وإدارة جميع المدفوعات والمعاملات
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="bg-white/40 backdrop-blur-md border-white/60"
          style={{ fontFamily: 'Tajawal' }}
        >
          <Download className="ml-2 h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Failed Payments Alert */}
      {failedPayments.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2" style={{ fontFamily: 'Tajawal' }}>
              <TrendingUp className="h-5 w-5" />
              مدفوعات فاشلة ({failedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
              يوجد {failedPayments.length} عملية دفع فاشلة تحتاج إلى المراجعة. انقر على "فشل" في الفلتر لعرضها.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث برقم المعاملة أو اسم المستخدم..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pr-10 bg-white/60"
              style={{ fontFamily: 'Tajawal' }}
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              updateFilters({ status: value === 'all' ? undefined : (value as PaymentStatus) })
            }
          >
            <SelectTrigger className="bg-white/60" style={{ fontFamily: 'Tajawal' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>
                جميع الحالات
              </SelectItem>
              <SelectItem value="completed" style={{ fontFamily: 'Tajawal' }}>
                مكتمل
              </SelectItem>
              <SelectItem value="pending" style={{ fontFamily: 'Tajawal' }}>
                قيد الانتظار
              </SelectItem>
              <SelectItem value="failed" style={{ fontFamily: 'Tajawal' }}>
                فشل
              </SelectItem>
              <SelectItem value="refunded" style={{ fontFamily: 'Tajawal' }}>
                مسترد
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.paymentMethod || 'all'}
            onValueChange={(value) =>
              updateFilters({
                paymentMethod: value === 'all' ? undefined : (value as 'visa' | 'apple-pay'),
              })
            }
          >
            <SelectTrigger className="bg-white/60" style={{ fontFamily: 'Tajawal' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>
                جميع الطرق
              </SelectItem>
              <SelectItem value="visa" style={{ fontFamily: 'Tajawal' }}>
                فيزا
              </SelectItem>
              <SelectItem value="apple-pay" style={{ fontFamily: 'Tajawal' }}>
                Apple Pay
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilters({ startDate: e.target.value })}
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
            placeholder="من تاريخ"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilters({ endDate: e.target.value })}
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
            placeholder="إلى تاريخ"
          />
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              updateFilters({
                search: '',
                status: undefined,
                paymentMethod: undefined,
                startDate: '',
                endDate: '',
              })
            }
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/60 hover:bg-white/20">
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  المستخدم
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الباقة
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  المبلغ
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الكوبون
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  طريقة الدفع
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الحالة
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  التاريخ
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-left" style={{ fontFamily: 'Tajawal' }}>
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8" style={{ fontFamily: 'Tajawal' }}>
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data && data.data.length > 0 ? (
                data.data.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-white/60 hover:bg-white/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(payment)}
                  >
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      <div>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-xs text-slate-500">{payment.user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" style={{ fontFamily: 'Tajawal' }}>
                      {payment.package.name}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      <div>
                        <div className="font-semibold">{payment.amount.toLocaleString('ar-EG')} ر.س</div>
                        {payment.discountAmount && payment.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            خصم: {payment.discountAmount.toLocaleString('ar-EG')} ر.س
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {payment.coupon ? (
                        <Badge variant="secondary" className="font-mono">
                          {payment.coupon.code}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {format(new Date(payment.createdAt), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(payment);
                        }}
                        className="hover:bg-white/60 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500" style={{ fontFamily: 'Tajawal' }}>
                    لا توجد مدفوعات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/60">
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Tajawal' }}>
              صفحة {data.pagination.page} من {data.pagination.totalPages} (إجمالي:{' '}
              {data.pagination.total.toLocaleString('ar-EG')} معاملة)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: filters.page! - 1 })}
                disabled={filters.page === 1}
                className="bg-white/40 backdrop-blur-md border-white/60 hover:bg-white/60"
                style={{ fontFamily: 'Tajawal' }}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: filters.page! + 1 })}
                disabled={filters.page === data.pagination.totalPages}
                className="bg-white/40 backdrop-blur-md border-white/60 hover:bg-white/60"
                style={{ fontFamily: 'Tajawal' }}
              >
                التالي
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <PaymentDetailsDialog
          payment={selectedPayment}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </div>
  );
}
