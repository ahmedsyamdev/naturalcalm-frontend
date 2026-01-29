import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import AuthService from "@/lib/api/services/AuthService";
import { validateEmail, validatePassword, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const passwordValidation = validatePassword(formData.password);

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("الرجاء إدخال جميع الحقول المطلوبة");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message || VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    try {
      setIsLoading(true);

      await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success("تم إنشاء الحساب بنجاح. سنرسل لك رمز التحقق على بريدك الإلكتروني");
      navigate("/otp", { state: { email: formData.email } });
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
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex items-end pb-8">
          <div className="w-full px-6 space-y-5">
            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">انضم الينا</h1>
              <p className="text-sm text-muted-foreground">
                من خلال إنشاء حساب، فإنك توافق على شروط الخدمة
                <br />
                <span className="text-primary">وسياسة الخصوصية</span> الخاصة بنا.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="الاسم"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور هنا"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              {formData.password && (
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

            {/* Signup Button */}
            <Button
              variant="auth"
              className="w-full"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري إنشاء الحساب...
                </span>
              ) : (
                "انشاء حساب"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">لديك حساب؟ </span>
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

export default Signup;
