/**
 * Reset Password Page
 * Allows users to reset their password with a verification code
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import AuthService from "@/lib/api/services/AuthService";
import { validatePassword, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!email) {
      toast.error("لم يتم العثور على البريد الإلكتروني");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const passwordValidation = validatePassword(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  const handleResetPassword = async () => {
    if (!formData.verificationCode || !formData.newPassword || !formData.confirmPassword) {
      toast.error("الرجاء إدخال جميع الحقول");
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message || VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    if (!passwordsMatch) {
      toast.error(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.resetPassword(email, formData.verificationCode, formData.newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
      navigate("/login");
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
          onClick={() => navigate("/forgot-password")}
          className="flex items-center gap-2 text-foreground hover:text-primary mb-8"
        >
          <ArrowRight size={20} />
          <span>رجوع</span>
        </button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-muted-foreground">
              أدخل رمز التحقق وكلمة المرور الجديدة
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="رمز التحقق"
                value={formData.verificationCode}
                onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
                className="rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور الجديدة"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="rounded-full h-14 px-6 pr-12 text-right bg-white border-border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.newPassword && (
                <div className="flex items-center gap-2 px-2">
                  {passwordValidation.isValid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${passwordValidation.isValid ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidation.isValid ? 'كلمة المرور قوية' : passwordValidation.message}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="تأكيد كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="rounded-full h-14 px-6 pr-12 text-right bg-white border-border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 px-2">
                  {passwordsMatch ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordsMatch ? 'كلمات المرور متطابقة' : 'كلمات المرور غير متطابقة'}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="auth"
              className="w-full"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التحديث...
                </span>
              ) : (
                "تغيير كلمة المرور"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
