/**
 * Add Coupon Dialog Component
 * Dialog for creating new discount coupons
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminSubscriptionService } from '@/lib/api/services/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AddCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCouponDialog({ open, onOpenChange }: AddCouponDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    maxUses: '',
    validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    validUntil: '',
    applicablePackages: [] as string[],
  });

  const { data: packages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => AdminSubscriptionService.getPackages(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      AdminSubscriptionService.createCoupon({
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses ? parseInt(data.maxUses) : undefined,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: new Date(data.validUntil).toISOString(),
        applicablePackages: data.applicablePackages.length > 0 ? data.applicablePackages : [],
      }),
    onSuccess: () => {
      toast({
        title: 'تم الإنشاء',
        description: 'تم إنشاء الكوبون بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || 'فشل إنشاء الكوبون',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: '',
      validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      validUntil: '',
      applicablePackages: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال كود الكوبون',
        variant: 'destructive',
      });
      return;
    }

    if (formData.discountValue <= 0) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون قيمة الخصم أكبر من صفر',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.validUntil) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد تاريخ انتهاء الصلاحية',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      toast({
        title: 'خطأ',
        description: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البداية',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        applicablePackages: [...formData.applicablePackages, packageId],
      });
    } else {
      setFormData({
        ...formData,
        applicablePackages: formData.applicablePackages.filter((id) => id !== packageId),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Tajawal' }}>إضافة كوبون جديد</DialogTitle>
          <DialogDescription style={{ fontFamily: 'Tajawal' }}>
            إنشاء كوبون خصم جديد للمستخدمين
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" style={{ fontFamily: 'Tajawal' }}>
              كود الكوبون *
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="مثال: SUMMER2024"
              required
              className="bg-white/40 font-mono"
              style={{ fontFamily: 'Tajawal' }}
            />
            <p className="text-xs text-slate-500" style={{ fontFamily: 'Tajawal' }}>
              سيتم تحويل الحروف إلى أحرف كبيرة تلقائياً
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType" style={{ fontFamily: 'Tajawal' }}>
                نوع الخصم *
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'percentage' | 'fixed') =>
                  setFormData({ ...formData, discountType: value })
                }
              >
                <SelectTrigger id="discountType" className="bg-white/40" style={{ fontFamily: 'Tajawal' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="percentage" style={{ fontFamily: 'Tajawal' }}>
                    نسبة مئوية
                  </SelectItem>
                  <SelectItem value="fixed" style={{ fontFamily: 'Tajawal' }}>
                    قيمة ثابتة
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue" style={{ fontFamily: 'Tajawal' }}>
                قيمة الخصم *{' '}
                {formData.discountType === 'percentage' ? '(%)' : '(ر.س)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                min="0"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: parseFloat(e.target.value) })
                }
                required
                className="bg-white/40"
                style={{ fontFamily: 'Tajawal' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUses" style={{ fontFamily: 'Tajawal' }}>
              الحد الأقصى للاستخدام
            </Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="اتركه فارغاً للاستخدام غير المحدود"
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom" style={{ fontFamily: 'Tajawal' }}>
                صالح من *
              </Label>
              <Input
                id="validFrom"
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
                className="bg-white/40"
                style={{ fontFamily: 'Tajawal' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil" style={{ fontFamily: 'Tajawal' }}>
                صالح حتى *
              </Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
                className="bg-white/40"
                style={{ fontFamily: 'Tajawal' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ fontFamily: 'Tajawal' }}>الباقات المطبقة</Label>
            <div className="border border-white/60 rounded-lg p-3 bg-white/20 space-y-2">
              {packages && packages.length > 0 ? (
                packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`package-${pkg.id}`}
                      checked={formData.applicablePackages.includes(pkg.id)}
                      onCheckedChange={(checked) =>
                        handlePackageToggle(pkg.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`package-${pkg.id}`}
                      className="text-sm cursor-pointer"
                      style={{ fontFamily: 'Tajawal' }}
                    >
                      {pkg.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                  لا توجد باقات متاحة
                </p>
              )}
              {formData.applicablePackages.length === 0 && packages && packages.length > 0 && (
                <p className="text-xs text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                  عدم اختيار أي باقة يعني تطبيق الكوبون على جميع الباقات
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createMutation.isPending}
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              style={{ fontFamily: 'Tajawal' }}
            >
              {createMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء الكوبون
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
