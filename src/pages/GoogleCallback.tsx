import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/lib/api/services/AuthService";
import { useAuth } from "@/contexts/AuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment (id_token is in the URL hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const idToken = params.get('id_token');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error(params.get('error_description') || 'فشل تسجيل الدخول عبر جوجل');
        }

        if (!idToken) {
          throw new Error('لم يتم استلام رمز التحقق من جوجل');
        }

        // Send the token to our backend
        await AuthService.socialLogin('google', idToken);

        // Refresh user data
        await refreshUser();

        // Clear the nonce
        sessionStorage.removeItem('google_auth_nonce');

        toast.success("تم تسجيل الدخول بنجاح");

        // Navigate to home
        window.location.href = "/home";
      } catch (err) {
        console.error('Google callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول';
        setError(errorMessage);
        toast.error(errorMessage);

        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg">{error}</p>
          <p className="text-muted-foreground">جاري إعادة التوجيه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-foreground text-lg">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
