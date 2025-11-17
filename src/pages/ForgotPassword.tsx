/**
 * Forgot Password Page
 * Allows users to request a password reset
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import AuthService from "@/lib/api/services/AuthService";
import { validatePhone, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";
import { CountrySelector } from "@/components/CountrySelector";
import { Country, DEFAULT_COUNTRY } from "@/lib/countries";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async () => {
    if (!phoneNumber) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      toast.error(VALIDATION_MESSAGES.INVALID_PHONE);
      return;
    }

    try {
      setIsLoading(true);

      // Remove leading zero from phone number for international format
      const cleanPhoneNumber = phoneNumber.startsWith('0')
        ? phoneNumber.substring(1)
        : phoneNumber;
      const fullPhoneNumber = `${selectedCountry.dialCode}${cleanPhoneNumber}`;

      await AuthService.forgotPassword(fullPhoneNumber);
      toast.success("تم إرسال رمز التحقق إلى هاتفك");
      navigate("/reset-password", { state: { phone: fullPhoneNumber } });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = getAuthErrorMessage(
        apiError.code,
        apiError.message
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-foreground hover:text-primary mb-8"
        >
          <ArrowRight size={20} />
          <span>رجوع</span>
        </button>

        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-muted-foreground">
              أدخل رقم هاتفك وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                />
                <Input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
                />
              </div>
            </div>

            <Button
              variant="auth"
              className="w-full"
              onClick={handleSendReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                "إرسال رمز التحقق"
              )}
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">تذكرت كلمة المرور؟ </span>
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:underline"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
