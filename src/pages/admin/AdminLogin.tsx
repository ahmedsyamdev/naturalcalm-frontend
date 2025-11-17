/**
 * AdminLogin Page
 * Login page for admin users with role verification
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAuthService } from '@/lib/api/services/admin';
import { setRememberMe } from '@/lib/api/tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // Set remember me preference before login
      setRememberMe(data.rememberMe);

      const response = await AdminAuthService.adminLogin(data);

      // Store user data in localStorage for admin persistence
      localStorage.setItem('userData', JSON.stringify(response.user));

      toast.success('تم تسجيل الدخول بنجاح');

      // Use window.location to force a full page reload and trigger AuthContext initialization
      window.location.href = '/admin/dashboard';
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage = error.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.';

      if (errorMessage.includes('Admin privileges required') || errorMessage.includes('Access denied')) {
        setError('الوصول مرفوض. صلاحيات المسؤول مطلوبة.');
      } else {
        setError(errorMessage);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" dir="rtl">
      <div className="w-full max-w-md px-6">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-full mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4091A5] to-[#535353] bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Tajawal' }}>
              لوحة تحكم المسؤول
            </h1>
            <p className="text-slate-600" style={{ fontFamily: 'Tajawal' }}>
              قم بتسجيل الدخول للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800" style={{ fontFamily: 'Tajawal' }}>
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifier (Phone/Email) */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                البريد الإلكتروني أو رقم الهاتف
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  placeholder="أدخل البريد الإلكتروني أو رقم الهاتف"
                  className="pr-10 text-right"
                  style={{ fontFamily: 'Tajawal' }}
                  {...register('identifier', {
                    required: 'هذا الحقل مطلوب',
                  })}
                  disabled={isLoading}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              {errors.identifier && (
                <p className="text-sm text-red-600 text-right" style={{ fontFamily: 'Tajawal' }}>
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 pl-10 text-right"
                  style={{ fontFamily: 'Tajawal' }}
                  {...register('password', {
                    required: 'هذا الحقل مطلوب',
                    minLength: {
                      value: 6,
                      message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
                    },
                  })}
                  disabled={isLoading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 text-right" style={{ fontFamily: 'Tajawal' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer" style={{ fontFamily: 'Tajawal' }}>
                تذكرني
              </Label>
              <Checkbox
                id="rememberMe"
                {...register('rememberMe')}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4091A5] to-[#535353] hover:from-[#357a8a] hover:to-[#424242] text-white py-6 text-base shadow-lg hover:shadow-xl transition-all"
              style={{ fontFamily: 'Tajawal' }}
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 mt-6 text-sm space-y-1" style={{ fontFamily: 'Tajawal' }}>
          <p>© 2025 Naturacalm. جميع الحقوق محفوظة.</p>
          <p className="flex items-center justify-center gap-1">
            <span>صُنع بـ</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span>بواسطة</span>
            <a
              href="https://www.qeematech.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline underline-offset-2"
            >
              قيمة تك
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
