/**
 * Payment Details Dialog Component
 * Dialog showing detailed payment information with refund functionality
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminSubscriptionService } from '@/lib/api/services/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Payment, PaymentStatus } from '@/types';
import { RefreshCcw, Loader2, User, CreditCard, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PaymentDetailsDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const refundMutation = useMutation({
    mutationFn: (reason: string) =>
      AdminSubscriptionService.refundPayment(payment.id, { reason }),
    onSuccess: () => {
      toast({
        title: 'تم الاسترداد',
        description: 'تم استرداد المبلغ بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setIsRefundDialogOpen(false);
      setRefundReason('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || 'فشل استرداد المبلغ',
        variant: 'destructive',
      });
    },
  });

  const handleRefund = () => {
    if (!refundReason.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سبب الاسترداد',
        variant: 'destructive',
      });
      return;
    }
    refundMutation.mutate(refundReason);
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

  const canRefund = payment.status === 'completed' && !payment.refundedAt;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Tajawal' }}>تفاصيل المعاملة</DialogTitle>
            <DialogDescription style={{ fontFamily: 'Tajawal' }}>
              رقم المعاملة: <span className="font-mono font-semibold">{payment.transactionId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                <User className="h-4 w-4 text-primary" />
                معلومات المستخدم
              </div>
              <div className="bg-white/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>الاسم:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>{payment.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>الهاتف:</span>
                  <span className="text-sm font-medium" dir="ltr">{payment.user.phone}</span>
                </div>
                {payment.user.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>البريد الإلكتروني:</span>
                    <span className="text-sm font-medium" dir="ltr">{payment.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Package Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                <Package className="h-4 w-4 text-primary" />
                معلومات الباقة
              </div>
              <div className="bg-white/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>الباقة:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>{payment.package.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>النوع:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>{payment.package.type}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                <DollarSign className="h-4 w-4 text-primary" />
                معلومات الدفع
              </div>
              <div className="bg-white/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>المبلغ الأصلي:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                    {payment.originalAmount.toLocaleString('ar-EG')} ر.س
                  </span>
                </div>
                {payment.discountAmount && payment.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm" style={{ fontFamily: 'Tajawal' }}>الخصم:</span>
                      <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                        - {payment.discountAmount.toLocaleString('ar-EG')} ر.س
                      </span>
                    </div>
                    {payment.coupon && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>الكوبون:</span>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {payment.coupon.code}
                        </Badge>
                      </div>
                    )}
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>المبلغ المدفوع:</span>
                  <span className="text-base font-bold text-primary" style={{ fontFamily: 'Tajawal' }}>
                    {payment.amount.toLocaleString('ar-EG')} ر.س
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                <CreditCard className="h-4 w-4 text-primary" />
                تفاصيل المعاملة
              </div>
              <div className="bg-white/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>طريقة الدفع:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                    {payment.paymentMethod === 'visa' ? 'فيزا' : 'Apple Pay'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>رقم المعاملة:</span>
                  <span className="text-sm font-mono font-medium">{payment.transactionId}</span>
                </div>
                {payment.stripePaymentIntentId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>Stripe Payment ID:</span>
                    <span className="text-xs font-mono text-slate-500">{payment.stripePaymentIntentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>الحالة:</span>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>تاريخ الإنشاء:</span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                  </span>
                </div>
                {payment.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>تاريخ الاكتمال:</span>
                    <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                      {format(new Date(payment.completedAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                    </span>
                  </div>
                )}
                {payment.refundedAt && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>تاريخ الاسترداد:</span>
                      <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                        {format(new Date(payment.refundedAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </span>
                    </div>
                    {payment.refundReason && (
                      <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <span className="text-xs text-orange-700 font-medium" style={{ fontFamily: 'Tajawal' }}>
                          سبب الاسترداد:
                        </span>
                        <p className="text-sm text-orange-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
                          {payment.refundReason}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Refund Button */}
            {canRefund && (
              <Button
                variant="destructive"
                onClick={() => setIsRefundDialogOpen(true)}
                className="w-full"
                style={{ fontFamily: 'Tajawal' }}
              >
                <RefreshCcw className="ml-2 h-4 w-4" />
                استرداد المبلغ
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Tajawal' }}>تأكيد الاسترداد</AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: 'Tajawal' }}>
              هل أنت متأكد من استرداد المبلغ لهذه المعاملة؟ سيتم إلغاء اشتراك المستخدم.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="refundReason" style={{ fontFamily: 'Tajawal' }}>
              سبب الاسترداد *
            </Label>
            <Textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="أدخل سبب الاسترداد..."
              rows={3}
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/40"
              style={{ fontFamily: 'Tajawal' }}
              disabled={refundMutation.isPending}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              className="bg-red-600 hover:bg-red-700"
              style={{ fontFamily: 'Tajawal' }}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الاسترداد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
