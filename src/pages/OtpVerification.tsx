import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthService from "@/lib/api/services/AuthService";
import { validateOTP, getAuthErrorMessage, VALIDATION_MESSAGES } from "@/lib/api/auth-errors";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/contexts/AuthContext";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("لم يتم العثور على البريد الإلكتروني");
      navigate("/login");
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (value && index === 5 && newOtp.every(digit => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otpValue = otpCode || otp.join("");

    if (otpValue.length !== 6) {
      toast.error(VALIDATION_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    if (!validateOTP(otpValue)) {
      toast.error(VALIDATION_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.verifyOTP(email, otpValue);

      updateUser(response.user);
      toast.success("تم التحقق بنجاح");

      if (response.user.subscription) {
        navigate("/home");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = getAuthErrorMessage(
        apiError.code,
        apiError.message
      );
      toast.error(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) {
      toast.error(`يمكنك إعادة الإرسال بعد ${formatTime(timer)}`);
      return;
    }

    try {
      setIsResending(true);
      await AuthService.sendOTP(email);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      toast.success("تم إعادة إرسال الرمز");
      document.getElementById("otp-0")?.focus();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = getAuthErrorMessage(
        apiError.code,
        apiError.message
      );
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Shield className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            ادخل رمز المصادقة المرسل الى بريدك الإلكتروني
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">البريد الإلكتروني 📧</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ادخل رمز التحقق المرسل إلى بريدك الإلكتروني.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 my-8" dir="ltr">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-14 h-14 text-center text-xl font-semibold rounded-lg border-2 focus:border-primary"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">اعد الارسال بعد</p>
          <p className="text-2xl font-bold text-primary">{formatTime(timer)}</p>
        </div>

        {/* Verify Button */}
        <Button
          variant="auth"
          className="w-full"
          onClick={() => handleVerify()}
          disabled={isLoading || otp.some(digit => !digit)}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التحقق...
            </span>
          ) : (
            "تأكيد"
          )}
        </Button>

        {/* Resend Link */}
        <div className="text-center">
          <button
            className={`text-sm ${timer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
            onClick={handleResend}
            disabled={timer > 0 || isResending}
          >
            {isResending ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإرسال...
              </span>
            ) : timer > 0 ? (
              `يمكنك الإرسال بعد ${formatTime(timer)}`
            ) : (
              "إعادة إرسال الرمز"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
