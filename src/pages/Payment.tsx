/**
 * Payment Page
 * Handle payment processing with coupon codes and payment methods
 */

import { useState, useEffect } from "react";
import { ArrowRight, Bell, Heart, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BottomNav from "@/components/BottomNav";
import { Package } from "@/types";
import { useValidateCoupon } from "@/hooks/queries/usePayment";
import { usePackages } from "@/hooks/queries/useSubscription";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import ApplePayButton from "@/components/payment/ApplePayButton";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: packages = [] } = usePackages();

  const selectedPackage = location.state?.selectedPackage as Package | undefined;

  useEffect(() => {
    if (!selectedPackage && packages.length > 0) {
      navigate("/subscription");
    }
  }, [selectedPackage, packages, navigate]);

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"visa" | "apple-pay">("visa");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; finalAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateCouponMutation = useValidateCoupon();

  // Helper function to safely parse price
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string') {
      // Remove non-numeric characters except decimal point
      const cleaned = price.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const basePrice = selectedPackage ? parsePrice(selectedPackage.price) : 0;
  const discount = appliedCoupon?.discount || 0;
  const totalPrice = appliedCoupon?.finalAmount || basePrice;

  const applyCoupon = async () => {
    if (!couponCode.trim() || !selectedPackage) return;

    setCouponError(null);
    try {
      const result = await validateCouponMutation.mutateAsync({
        code: couponCode,
        packageId: selectedPackage.id,
      });
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode,
          discount: result.discount,
          finalAmount: result.finalAmount,
        });
      } else {
        setCouponError(result.message || "كود الخصم غير صالح");
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError("فشل في التحقق من كود الخصم");
      setAppliedCoupon(null);
    }
  };

  if (!selectedPackage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-primary" />
              </button>
            <button 
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-primary" />
            </button>
            </div>
            <h1 className="text-xl font-bold flex-1 text-center">الدفع</h1>
            <button onClick={() => navigate(-1)}>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Selected Package */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-right">الباقة المختارة</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xl font-bold text-primary">{selectedPackage.price}</p>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{selectedPackage.name}</h3>
                <span className="text-xl">💎</span>
              </div>
            </div>
            {selectedPackage.discount && (
              <p className="text-sm text-green-600 text-right">{selectedPackage.discount}</p>
            )}
          </div>
        </div>

        {/* Coupon Code */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-right">كود الخصم</h2>
          <div className="flex gap-2">
            <Button
              onClick={applyCoupon}
              disabled={validateCouponMutation.isPending}
              className="bg-primary text-white rounded-full px-6"
            >
              {validateCouponMutation.isPending ? "جاري التحقق..." : "تطبيق"}
            </Button>
            <Input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError(null);
              }}
              placeholder="ادخل كود الخصم"
              className="flex-1 h-12 rounded-full text-right"
              disabled={validateCouponMutation.isPending}
            />
          </div>
          {couponError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{couponError}</AlertDescription>
            </Alert>
          )}
          {appliedCoupon && (
            <Alert className="mt-2 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                تم تطبيق الخصم بنجاح! كود: {appliedCoupon.code}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Summary */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-right">ملخص الدفع</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium">{basePrice}$</p>
              <p className="text-sm text-muted-foreground">التكلفة</p>
            </div>
            {appliedCoupon && (
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-green-600">-{discount}$</p>
                <p className="text-sm text-muted-foreground">خصم</p>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">{totalPrice}$</p>
              <p className="text-sm font-medium">إجمالي التكلفة</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-right">طريقة الدفع</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "visa" | "apple-pay")}
            >
              <div className="space-y-3">
                {/* Visa */}
                <div
                  className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer ${
                    paymentMethod === "visa" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("visa")}
                >
                  <RadioGroupItem value="visa" id="visa" />
                  <Label
                    htmlFor="visa"
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="font-medium">فيزا / بطاقة ائتمان</span>
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                  </Label>
                </div>

                {/* Apple Pay */}
                <div
                  className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer ${
                    paymentMethod === "apple-pay" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("apple-pay")}
                >
                  <RadioGroupItem value="apple-pay" id="apple-pay" />
                  <Label
                    htmlFor="apple-pay"
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="font-medium">أبل باي</span>
                    <div className="w-10 h-10">
                      <span className="text-2xl">🍎</span>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          {paymentMethod === "visa" ? (
            <StripePaymentForm
              packageInfo={selectedPackage}
              couponCode={appliedCoupon?.code}
              onSuccess={() => navigate("/payment-success")}
              onError={(error) => navigate("/payment-failure", { state: { error } })}
            />
          ) : (
            <ApplePayButton
              packageInfo={selectedPackage}
              couponCode={appliedCoupon?.code}
              amount={totalPrice}
              onSuccess={() => navigate("/payment-success")}
              onError={(error) => navigate("/payment-failure", { state: { error } })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;

