/**
 * Payment Success Page
 * Display success message after successful payment
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Subscription } from "@/types";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const subscription = location.state?.subscription as Subscription | undefined;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">تم الدفع بنجاح!</h1>
            <p className="text-gray-600">
              تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بجميع المحتويات المميزة.
            </p>
          </div>

          {/* Subscription Details */}
          {subscription && (
            <div className="bg-primary/5 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{subscription.price}</span>
                <span className="text-gray-600">المبلغ المدفوع:</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {subscription.type === "premium" ? "باقة بريميوم" : "باقة اساسية"}
                </span>
                <span className="text-gray-600">نوع الاشتراك:</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{subscription.daysRemaining} يوم</span>
                <span className="text-gray-600">مدة الاشتراك:</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/home")}
              className="w-full bg-primary text-white rounded-full h-12 font-medium"
            >
              العودة للرئيسية
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="w-full rounded-full h-12 font-medium"
            >
              عرض الملف الشخصي
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
