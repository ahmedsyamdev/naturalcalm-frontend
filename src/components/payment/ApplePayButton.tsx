/**
 * Apple Pay Button Component
 * Handles Apple Pay payment via Stripe
 */

import { useState, useEffect } from 'react';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getStripe } from '@/lib/stripe/config';
import { useCreatePaymentIntent, useConfirmPayment } from '@/hooks/queries/usePayment';
import { Package } from '@/types';
import type { PaymentRequest } from '@stripe/stripe-js';

interface ApplePayButtonProps {
  packageInfo: Package;
  couponCode?: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ApplePayForm = ({ packageInfo, couponCode, amount, onSuccess, onError }: ApplePayButtonProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const pr = stripe.paymentRequest({
      country: 'SA',
      currency: 'usd',
      total: {
        label: packageInfo.name,
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        const paymentIntent = await createPaymentIntentMutation.mutateAsync({
          packageId: packageInfo.id,
          couponCode,
        });

        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          paymentIntent.clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          const errorMessage = confirmError.message || 'فشلت عملية الدفع';
          setError(errorMessage);
          onError?.(errorMessage);
        } else {
          ev.complete('success');

          if (confirmedPaymentIntent?.status === 'succeeded') {
            await confirmPaymentMutation.mutateAsync({
              paymentIntentId: confirmedPaymentIntent.id,
              paymentMethodId: ev.paymentMethod.id,
            });
            onSuccess?.();
          } else if (confirmedPaymentIntent?.status === 'requires_action') {
            const { error: actionError } = await stripe.confirmCardPayment(paymentIntent.clientSecret);
            if (actionError) {
              const errorMessage = actionError.message || 'فشلت عملية الدفع';
              setError(errorMessage);
              onError?.(errorMessage);
            } else {
              await confirmPaymentMutation.mutateAsync({
                paymentIntentId: confirmedPaymentIntent.id,
                paymentMethodId: ev.paymentMethod.id,
              });
              onSuccess?.();
            }
          }
        }
      } catch (err) {
        ev.complete('fail');
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الدفع';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    });
  }, [stripe, packageInfo, amount, couponCode, createPaymentIntentMutation, confirmPaymentMutation, onSuccess, onError]);

  if (!canMakePayment) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Apple Pay غير متاح على هذا الجهاز
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {paymentRequest && (
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'buy',
                theme: 'dark',
                height: '48px',
              },
            },
          }}
        />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const ApplePayButton = (props: ApplePayButtonProps) => {
  const [stripePromise] = useState(() => getStripe());

  return (
    <Elements stripe={stripePromise}>
      <ApplePayForm {...props} />
    </Elements>
  );
};

export default ApplePayButton;
