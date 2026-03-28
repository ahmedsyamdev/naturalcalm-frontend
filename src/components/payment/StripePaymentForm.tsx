/**
 * Stripe Payment Form Component
 * Handles credit card payment via Stripe
 */

import { useState, FormEvent } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getStripe } from '@/lib/stripe/config';
import { useCreatePaymentIntent, useConfirmPayment } from '@/hooks/queries/usePayment';
import { Package } from '@/types';

interface StripePaymentFormProps {
  packageInfo: Package;
  couponCode?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentForm = ({ packageInfo, couponCode, onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        packageId: packageInfo.id,
        couponCode,
      });

      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        const errorMessage = stripeError.message || 'فشلت عملية الدفع';
        setError(errorMessage);
        onError?.(errorMessage);
      } else if (confirmedPaymentIntent?.status === 'succeeded') {
        await confirmPaymentMutation.mutateAsync({
          paymentIntentId: confirmedPaymentIntent.id,
        });
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الدفع';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
                direction: 'ltr',
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true,
          }}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full bg-primary text-white rounded-full h-12 font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري المعالجة...
          </>
        ) : (
          'إتمام الدفع'
        )}
      </Button>
    </form>
  );
};

const StripePaymentForm = (props: StripePaymentFormProps) => {
  const [stripePromise] = useState(() => getStripe());

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
