/**
 * Admin Settings Page
 * Manage admin profile and system settings
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, HardDrive, Cloud, Save, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const profileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور يجب أن يكون 6 أحرف على الأقل'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function Settings() {
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'r2'>('local');
  const [isUpdatingStorage, setIsUpdatingStorage] = useState(false);
  const [currency, setCurrency] = useState<string>('SAR');
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Admin User',
      email: 'admin@naturacalm.com',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      // TODO: Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث معلومات الحساب',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المعلومات',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      // TODO: Call API to update password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تغيير كلمة المرور',
      });
      resetPassword();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تغيير كلمة المرور',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleStorageToggle = async (checked: boolean) => {
    const newStorageType = checked ? 'r2' : 'local';
    setIsUpdatingStorage(true);

    try {
      // TODO: Call API to update storage settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStorageType(newStorageType);
      toast({
        title: 'تم التحديث بنجاح',
        description: `تم التبديل إلى ${newStorageType === 'r2' ? 'Cloudflare R2' : 'التخزين المحلي'}`,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث إعدادات التخزين',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStorage(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setIsUpdatingCurrency(true);

    try {
      // TODO: Call API to update currency settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrency(newCurrency);
      toast({
        title: 'تم التحديث بنجاح',
        description: `تم تغيير العملة إلى ${newCurrency}`,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث إعدادات العملة',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingCurrency(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#4091A5] to-[#535353] rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Tajawal' }}>
            الإعدادات
          </h1>
          <p className="text-white/90" style={{ fontFamily: 'Tajawal' }}>
            إدارة الحساب وإعدادات النظام
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle style={{ fontFamily: 'Tajawal' }}>معلومات الحساب</CardTitle>
                <CardDescription style={{ fontFamily: 'Tajawal' }}>
                  تحديث معلومات الحساب الشخصية
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" style={{ fontFamily: 'Tajawal' }}>
                  الاسم *
                </Label>
                <Input
                  id="name"
                  {...registerProfile('name')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أدخل الاسم"
                />
                {profileErrors.name && (
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" style={{ fontFamily: 'Tajawal' }}>
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أدخل البريد الإلكتروني"
                />
                {profileErrors.email && (
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" style={{ fontFamily: 'Tajawal' }}>
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  {...registerProfile('phone')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-gradient-to-r from-[#4091A5] to-[#535353] text-white"
                style={{ fontFamily: 'Tajawal' }}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle style={{ fontFamily: 'Tajawal' }}>تغيير كلمة المرور</CardTitle>
                <CardDescription style={{ fontFamily: 'Tajawal' }}>
                  تحديث كلمة المرور الخاصة بك
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" style={{ fontFamily: 'Tajawal' }}>
                  كلمة المرور الحالية *
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أدخل كلمة المرور الحالية"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" style={{ fontFamily: 'Tajawal' }}>
                  كلمة المرور الجديدة *
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" style={{ fontFamily: 'Tajawal' }}>
                  تأكيد كلمة المرور *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className="bg-white/60 border-white/80"
                  style={{ fontFamily: 'Tajawal' }}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Tajawal' }}>
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-gradient-to-r from-[#4091A5] to-[#535353] text-white"
                style={{ fontFamily: 'Tajawal' }}
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    تغيير كلمة المرور
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle style={{ fontFamily: 'Tajawal' }}>إعدادات العملة</CardTitle>
                <CardDescription style={{ fontFamily: 'Tajawal' }}>
                  اختر العملة المستخدمة في التطبيق
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" style={{ fontFamily: 'Tajawal' }}>
                  العملة *
                </Label>
                <Select
                  value={currency}
                  onValueChange={handleCurrencyChange}
                  disabled={isUpdatingCurrency}
                >
                  <SelectTrigger
                    id="currency"
                    className="bg-white/60 border-white/80"
                    style={{ fontFamily: 'Tajawal' }}
                  >
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent style={{ fontFamily: 'Tajawal' }}>
                    <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                    <SelectItem value="EGP">جنيه مصري (ج.م)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                    <SelectItem value="EUR">يورو (€)</SelectItem>
                    <SelectItem value="AED">درهم إماراتي (د.إ)</SelectItem>
                    <SelectItem value="KWD">دينار كويتي (د.ك)</SelectItem>
                    <SelectItem value="BHD">دينار بحريني (د.ب)</SelectItem>
                    <SelectItem value="OMR">ريال عماني (ر.ع)</SelectItem>
                    <SelectItem value="QAR">ريال قطري (ر.ق)</SelectItem>
                    <SelectItem value="JOD">دينار أردني (د.أ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800" style={{ fontFamily: 'Tajawal' }}>
                  سيتم استخدام هذه العملة في جميع أنحاء التطبيق بما في ذلك الباقات، المدفوعات، والإحصائيات
                </p>
              </div>

              {isUpdatingCurrency && (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#4091A5]" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-xl flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle style={{ fontFamily: 'Tajawal' }}>إعدادات التخزين</CardTitle>
                <CardDescription style={{ fontFamily: 'Tajawal' }}>
                  اختر نظام التخزين للملفات
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-white/60 to-white/40 rounded-xl border border-white/60">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    storageType === 'local'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gray-200'
                  }`}>
                    <HardDrive className={`w-7 h-7 ${storageType === 'local' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ fontFamily: 'Tajawal' }}>
                      التخزين المحلي
                    </h3>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Tajawal' }}>
                      حفظ الملفات على الخادم المحلي
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4 px-6 py-3 bg-white/60 rounded-full border border-white/80">
                  <span className="text-sm font-medium" style={{ fontFamily: 'Tajawal' }}>
                    {storageType === 'local' ? 'التخزين المحلي' : 'Cloudflare R2'}
                  </span>
                  <Switch
                    checked={storageType === 'r2'}
                    onCheckedChange={handleStorageToggle}
                    disabled={isUpdatingStorage}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-white/60 to-white/40 rounded-xl border border-white/60">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    storageType === 'r2'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                      : 'bg-gray-200'
                  }`}>
                    <Cloud className={`w-7 h-7 ${storageType === 'r2' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ fontFamily: 'Tajawal' }}>
                      Cloudflare R2
                    </h3>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Tajawal' }}>
                      حفظ الملفات على التخزين السحابي
                    </p>
                  </div>
                </div>
              </div>

              {storageType === 'r2' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800" style={{ fontFamily: 'Tajawal' }}>
                    تأكد من تكوين متغيرات البيئة الخاصة بـ R2 في ملف .env
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
