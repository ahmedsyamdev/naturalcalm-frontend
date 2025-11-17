/**
 * Payment Failure Page
 * Display error message after failed payment
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error;

  const getErrorMessage = () => {
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    return "حدث خطأ غير متوقع أثناء معالجة الدفع";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">فشلت عملية الدفع</h1>
            <p className="text-gray-600">{getErrorMessage()}</p>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-2xl p-4 text-right space-y-2">
            <p className="font-semibold text-sm">نصائح:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>تأكد من صحة بيانات البطاقة</li>
              <li>تأكد من توفر رصيد كافٍ</li>
              <li>تحقق من اتصالك بالإنترنت</li>
              <li>حاول استخدام طريقة دفع أخرى</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate(-1)}
              className="w-full bg-primary text-white rounded-full h-12 font-medium"
            >
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => navigate("/subscription")}
              variant="outline"
              className="w-full rounded-full h-12 font-medium"
            >
              العودة للباقات
            </Button>
            <Button
              onClick={() => navigate("/home")}
              variant="ghost"
              className="w-full rounded-full h-12 font-medium text-gray-600"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
