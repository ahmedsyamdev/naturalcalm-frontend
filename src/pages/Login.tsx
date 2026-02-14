import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("الرجاء إدخال جميع الحقول");
      return;
    }

    if (!validateEmail(email)) {
      toast.error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return;
    }

    if (password.length < 6) {
      toast.error(VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    try {
      setIsLoading(true);

      await login({
        email,
        password,
        rememberMe
      });

      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/home");
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
          <form onSubmit={handleLogin} className="w-full px-6 space-y-6">
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">اهلا بك مجددا</h1>
              <p className="text-muted-foreground">سجل الدخول الى حسابك</p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-14 px-6 text-right bg-white border-border shadow-sm"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور هنا"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="flex justify-start px-2">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary text-sm hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="remember" className="text-sm text-foreground">
                تذكرني
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="auth"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary font-medium hover:underline"
              >
                انشاء حساب
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
