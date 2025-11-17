/**
 * Admin Coupons Management Page
 * Complete coupon management with CRUD operations, filters, and stats
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminSubscriptionService, type CouponFilters } from '@/lib/api/services/admin';
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
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Eye, ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Coupon } from '@/types';
import { AddCouponDialog } from '@/components/admin/AddCouponDialog';
import { EditCouponDialog } from '@/components/admin/EditCouponDialog';
import { CouponStatsDialog } from '@/components/admin/CouponStatsDialog';

export default function CouponsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<CouponFilters>({
    page: 1,
    limit: 20,
    search: '',
    isActive: undefined,
    isExpired: undefined,
  });

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons', filters],
    queryFn: () => AdminSubscriptionService.getCoupons(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminSubscriptionService.deleteCoupon(id),
    onSuccess: () => {
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الكوبون بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteCouponId(null);
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الكوبون',
        variant: 'destructive',
      });
    },
  });

  const updateFilters = (updates: Partial<CouponFilters>) => {
    setFilters({ ...filters, ...updates, page: updates.page !== undefined ? updates.page : 1 });
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditDialogOpen(true);
  };

  const handleViewStats = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsStatsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteCouponId(id);
  };

  const confirmDelete = () => {
    if (deleteCouponId) {
      deleteMutation.mutate(deleteCouponId);
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return <Badge variant="secondary" style={{ fontFamily: 'Tajawal' }}>غير نشط</Badge>;
    }
    if (isExpired(coupon.validUntil)) {
      return <Badge variant="destructive" style={{ fontFamily: 'Tajawal' }}>منتهي</Badge>;
    }
    return <Badge variant="default" className="bg-green-500" style={{ fontFamily: 'Tajawal' }}>نشط</Badge>;
  };

  const getUsageProgress = (coupon: Coupon) => {
    if (!coupon.maxUses) return 0;
    return (coupon.usedCount / coupon.maxUses) * 100;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
            إدارة الكوبونات
          </h1>
          <p className="text-slate-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            إنشاء وإدارة كوبونات الخصم
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
          style={{ fontFamily: 'Tajawal' }}
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة كوبون
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث بالكود..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pr-10 bg-white/60"
              style={{ fontFamily: 'Tajawal' }}
            />
          </div>

          <Select
            value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
            onValueChange={(value) =>
              updateFilters({
                isActive: value === 'all' ? undefined : value === 'active',
              })
            }
          >
            <SelectTrigger className="bg-white/60" style={{ fontFamily: 'Tajawal' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>
                جميع الحالات
              </SelectItem>
              <SelectItem value="active" style={{ fontFamily: 'Tajawal' }}>
                نشط
              </SelectItem>
              <SelectItem value="inactive" style={{ fontFamily: 'Tajawal' }}>
                غير نشط
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.isExpired === undefined ? 'all' : filters.isExpired ? 'expired' : 'valid'}
            onValueChange={(value) =>
              updateFilters({
                isExpired: value === 'all' ? undefined : value === 'expired',
              })
            }
          >
            <SelectTrigger className="bg-white/60" style={{ fontFamily: 'Tajawal' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>
                جميع الصلاحيات
              </SelectItem>
              <SelectItem value="valid" style={{ fontFamily: 'Tajawal' }}>
                ساري
              </SelectItem>
              <SelectItem value="expired" style={{ fontFamily: 'Tajawal' }}>
                منتهي
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() =>
              updateFilters({
                search: '',
                isActive: undefined,
                isExpired: undefined,
              })
            }
            className="bg-white/60"
            style={{ fontFamily: 'Tajawal' }}
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/60 hover:bg-white/20">
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الكود
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  نوع الخصم
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  قيمة الخصم
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الاستخدام
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  صالح حتى
                </TableHead>
                <TableHead className="text-gray-700 font-semibold" style={{ fontFamily: 'Tajawal' }}>
                  الحالة
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-left" style={{ fontFamily: 'Tajawal' }}>
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" style={{ fontFamily: 'Tajawal' }}>
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data && data.data.length > 0 ? (
                data.data.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className="border-white/60 hover:bg-white/30 transition-colors"
                  >
                    <TableCell className="font-mono font-semibold" style={{ fontFamily: 'Tajawal' }}>
                      {coupon.code}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `${coupon.discountValue} ر.س`}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm" style={{ fontFamily: 'Tajawal' }}>
                          {coupon.usedCount} / {coupon.maxUses || '∞'}
                        </div>
                        {coupon.maxUses && (
                          <Progress value={getUsageProgress(coupon)} className="h-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Tajawal' }}>
                      {format(new Date(coupon.validUntil), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewStats(coupon)}
                          className="hover:bg-white/60 h-8 w-8"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(coupon)}
                          className="hover:bg-white/60 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon.id)}
                          className="hover:bg-red-100 text-red-600 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500" style={{ fontFamily: 'Tajawal' }}>
                    لا توجد كوبونات
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
              صفحة {data.pagination.page} من {data.pagination.totalPages}
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

      {/* Dialogs */}
      <AddCouponDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {selectedCoupon && (
        <>
          <EditCouponDialog
            coupon={selectedCoupon}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
          <CouponStatsDialog
            couponId={selectedCoupon.id}
            couponCode={selectedCoupon.code}
            open={isStatsDialogOpen}
            onOpenChange={setIsStatsDialogOpen}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCouponId} onOpenChange={() => setDeleteCouponId(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Tajawal' }}>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: 'Tajawal' }}>
              هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              style={{ fontFamily: 'Tajawal' }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
