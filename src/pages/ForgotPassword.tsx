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
import { validateEmail, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      toast.error("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    if (!validateEmail(email)) {
      toast.error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return;
    }

    try {
      setIsLoading(true);

      await AuthService.forgotPassword(email);
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      navigate("/reset-password", { state: { email } });
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
              أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
              />
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
