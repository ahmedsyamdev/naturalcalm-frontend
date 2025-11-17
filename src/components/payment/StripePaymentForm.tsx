/**
 * Stripe Payment Form Component
 * Handles credit card payment via Stripe or Test Payment
 */

import { useState, useEffect, FormEvent } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, TestTube2 } from 'lucide-react';
import { getStripe } from '@/lib/stripe/config';
import { useCreatePaymentIntent, useConfirmPayment } from '@/hooks/queries/usePayment';
import { Package } from '@/types';
import apiClient from '@/lib/api/client';

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

  // Test mode state
  const [useTestMode, setUseTestMode] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();

  // Test card numbers
  const testCardNumbers = [
    '4242424242424242',
    '5555555555554444',
    '378282246310005',
    '6011111111111117',
    '4000056655665556',
  ];

  // Check if card number is a test card
  const isTestCard = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    return testCardNumbers.includes(cleaned);
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
      // Check if it's a test card
      if (isTestCard(value)) {
        setUseTestMode(true);
      }
    }
  };

  // Handle test payment
  const handleTestPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/test-payment', {
        packageId: packageInfo.id,
        couponCode,
        cardNumber: cardNumber.replace(/\s/g, ''),
      });

      if (response.data.success) {
        onSuccess?.();
      } else {
        throw new Error(response.data.message || 'فشل الدفع التجريبي');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء معالجة الدفع';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle normal Stripe payment
  const handleStripePayment = async () => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (useTestMode) {
      await handleTestPayment();
    } else {
      await handleStripePayment();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {useTestMode && (
        <Alert className="bg-amber-50 border-amber-200">
          <TestTube2 className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            وضع الاختبار مفعّل - استخدام بطاقة اختبار
          </AlertDescription>
        </Alert>
      )}

      {useTestMode ? (
        // Test Mode - Simple Card Inputs
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber" className="text-sm font-medium mb-2 block text-right">
              رقم البطاقة
            </Label>
            <Input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              className="text-left"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardCvc" className="text-sm font-medium mb-2 block text-right">
                CVC
              </Label>
              <Input
                id="cardCvc"
                type="text"
                value={cardCvc}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) setCardCvc(value);
                }}
                placeholder="123"
                className="text-left"
                maxLength={4}
              />
            </div>
            <div>
              <Label htmlFor="cardExpiry" className="text-sm font-medium mb-2 block text-right">
                تاريخ الانتهاء
              </Label>
              <Input
                id="cardExpiry"
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="text-left"
                maxLength={5}
              />
            </div>
          </div>
        </div>
      ) : (
        // Normal Mode - Stripe CardElement
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
      )}

      {!useTestMode && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setUseTestMode(true)}
            className="text-sm text-primary underline"
          >
            استخدام بطاقة اختبار؟
          </button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={useTestMode ? (cardNumber.length < 16 || isProcessing) : (!stripe || !cardComplete || isProcessing)}
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
