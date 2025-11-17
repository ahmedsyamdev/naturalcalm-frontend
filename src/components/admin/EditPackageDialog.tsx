/**
 * Edit Package Dialog Component
 * Dialog for editing subscription package details
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package } from '@/types';
import { Loader2 } from 'lucide-react';

interface EditPackageDialogProps {
  package: Package;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPackageDialog({ package: pkg, open, onOpenChange }: EditPackageDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: pkg.name,
    price: typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price,
    discount: pkg.discount ? parseFloat(pkg.discount.replace('%', '')) : 0,
    durationInDays: pkg.durationDays || 30,
    features: pkg.features.join('\n'),
    isActive: pkg.isActive ?? true,
  });

  useEffect(() => {
    setFormData({
      name: pkg.name,
      price: typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price,
      discount: pkg.discount ? parseFloat(pkg.discount.replace('%', '')) : 0,
      durationInDays: pkg.durationDays || 30,
      features: pkg.features.join('\n'),
      isActive: pkg.isActive ?? true,
    });
  }, [pkg]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      AdminSubscriptionService.updatePackage(pkg.id, {
        name: data.name,
        price: data.price,
        discount: data.discount,
        durationInDays: data.durationInDays,
        features: data.features.split('\n').filter((f) => f.trim()),
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الباقة بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الباقة',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md" dir="rtl">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Tajawal' }}>تعديل الباقة</DialogTitle>
          <DialogDescription style={{ fontFamily: 'Tajawal' }}>
            تعديل تفاصيل باقة الاشتراك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" style={{ fontFamily: 'Tajawal' }}>
              اسم الباقة
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" style={{ fontFamily: 'Tajawal' }}>
                السعر (ر.س)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                className="bg-white/40"
                style={{ fontFamily: 'Tajawal' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount" style={{ fontFamily: 'Tajawal' }}>
                الخصم (%)
              </Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                className="bg-white/40"
                style={{ fontFamily: 'Tajawal' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationInDays" style={{ fontFamily: 'Tajawal' }}>
              مدة الاشتراك (بالأيام)
            </Label>
            <Input
              id="durationInDays"
              type="number"
              min="1"
              value={formData.durationInDays}
              onChange={(e) => setFormData({ ...formData, durationInDays: parseInt(e.target.value) || 1 })}
              required
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
              placeholder="مثال: 30 (شهر), 365 (سنة)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features" style={{ fontFamily: 'Tajawal' }}>
              المميزات (سطر واحد لكل ميزة)
            </Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={6}
              required
              className="bg-white/40 resize-none"
              style={{ fontFamily: 'Tajawal' }}
              placeholder="أدخل كل ميزة في سطر منفصل"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" style={{ fontFamily: 'Tajawal' }}>
              الباقة نشطة
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              style={{ fontFamily: 'Tajawal' }}
            >
              {updateMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
