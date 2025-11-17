/**
 * Admin User Details Page
 * Comprehensive user profile with all management features
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminUserService, type UpdateUserData, type GrantSubscriptionData, type BanUserData, AdminSubscriptionServiceDefault } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  Edit,
  CreditCard,
  ShieldCheck,
  Ban,
  Download,
  Trash2,
  Clock,
  Heart,
  BookOpen,
  CheckCircle2,
  Play,
  Calendar,
  ShieldOff,
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [editData, setEditData] = useState<UpdateUserData>({});
  const [subscriptionData, setSubscriptionData] = useState<GrantSubscriptionData>({
    packageId: undefined as any,
    durationDays: 30,
  });
  const [banData, setBanData] = useState<BanUserData>({
    reason: '',
    permanent: false,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-details', userId],
    queryFn: () => AdminUserService.getUserDetails(userId!),
    enabled: !!userId,
  });

  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      console.log('Fetching packages...');
      const result = await AdminSubscriptionServiceDefault.getPackages();
      console.log('Packages result:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error fetching packages:', error);
    },
  });

  console.log('Packages state - data:', packages, 'loading:', packagesLoading, 'error:', packagesError);

  // Auto-select first package when dialog opens and packages are loaded
  useEffect(() => {
    if (subscriptionDialogOpen && packages && packages.length > 0 && !subscriptionData.packageId) {
      const firstPackage = packages[0];
      const packageId = firstPackage._id || firstPackage.id;
      const defaultDays = firstPackage.durationDays || (firstPackage.period === 'سنة' ? 365 : 30);
      console.log('Auto-selecting first package:', packageId, 'days:', defaultDays, 'package:', firstPackage);
      setSubscriptionData({
        packageId: packageId,
        durationDays: defaultDays,
      });
    }
  }, [subscriptionDialogOpen, packages, subscriptionData.packageId]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserData) => AdminUserService.updateUser(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      setEditDialogOpen(false);
      toast({ title: 'تم تحديث المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل تحديث المستخدم', variant: 'destructive' });
    },
  });

  const grantSubscriptionMutation = useMutation({
    mutationFn: (data: GrantSubscriptionData) => AdminUserService.grantSubscription(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      setSubscriptionDialogOpen(false);
      toast({ title: 'تم منح الاشتراك بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل منح الاشتراك', variant: 'destructive' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => AdminUserService.updateUser(userId!, { isVerified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      toast({ title: 'تم توثيق المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل توثيق المستخدم', variant: 'destructive' });
    },
  });

  const banMutation = useMutation({
    mutationFn: (data: BanUserData) => AdminUserService.banUser(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      setBanDialogOpen(false);
      toast({ title: 'تم حظر المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل حظر المستخدم', variant: 'destructive' });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: () => AdminUserService.unbanUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      toast({ title: 'تم إلغاء حظر المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل إلغاء الحظر', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => AdminUserService.deleteUser(userId!),
    onSuccess: () => {
      toast({ title: 'تم حذف المستخدم بنجاح' });
      navigate('/admin/users');
    },
    onError: () => {
      toast({ title: 'فشل حذف المستخدم', variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => AdminUserService.exportUserData(userId!),
    onSuccess: (blob) => {
      try {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${userId}-data.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: 'تم تصدير البيانات بنجاح' });
      } catch (error) {
        console.error('Export blob error:', error);
        toast({ title: 'فشل تصدير البيانات', variant: 'destructive' });
      }
    },
    onError: (error: any) => {
      console.error('Export mutation error:', error);
      toast({
        title: 'فشل تصدير البيانات',
        description: error?.response?.data?.message || error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    },
  });

  // Process activity data for chart (always show chart, even with no data)
  const activityChartData = user ? (() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    const activityByDate: Record<string, number> = {};

    // Process user activity if exists
    if (user.recentActivity && user.recentActivity.length > 0) {
      user.recentActivity.forEach((session) => {
        const date = format(new Date(session.createdAt), 'yyyy-MM-dd');
        activityByDate[date] = (activityByDate[date] || 0) + Math.round(session.duration / 60);
      });
    }

    return last30Days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        label: format(date, 'dd MMM', { locale: ar }),
        minutes: activityByDate[dateStr] || 0,
      };
    });
  })() : [];

  const handleEditSubmit = () => {
    updateMutation.mutate(editData);
  };

  const handleGrantSubscription = () => {
    grantSubscriptionMutation.mutate(subscriptionData);
  };

  const handleBanUser = () => {
    banMutation.mutate(banData);
  };

  const handleDeleteUser = () => {
    if (deleteConfirmText === user?.name) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl" style={{ fontFamily: 'Tajawal' }}>
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl" style={{ fontFamily: 'Tajawal' }}>
        <div className="text-gray-500">المستخدم غير موجود</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl" style={{ fontFamily: 'Tajawal' }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/users')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">تفاصيل المستخدم</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-[#4091A5] text-white text-2xl">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  {user.role === 'admin' && (
                    <Badge variant="outline" className="mt-2">مسؤول</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-500">رقم الهاتف</div>
                  <div className="font-medium">{user.phone}</div>
                </div>
                {user.email && (
                  <div>
                    <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">حالة التوثيق</div>
                  <div className="mt-1">
                    {user.isVerified ? (
                      <Badge className="bg-green-100 text-green-700">موثق</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">غير موثق</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">تاريخ التسجيل</div>
                  <div className="font-medium">
                    {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <div className="text-sm text-gray-500">آخر تسجيل دخول</div>
                    <div className="font-medium">
                      {format(new Date(user.lastLoginAt), 'dd MMMM yyyy', { locale: ar })}
                    </div>
                  </div>
                )}
              </div>

              {user.isBanned && (
                <div className="pt-4 border-t">
                  <Badge variant="destructive" className="w-full justify-center py-2">
                    محظور
                  </Badge>
                  {user.banReason && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="font-medium">سبب الحظر:</div>
                      <div className="mt-1">{user.banReason}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-[12px]"
                onClick={() => {
                  setEditData({ name: user.name, email: user.email, role: user.role });
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
                تعديل المعلومات
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-[12px]"
                onClick={() => {
                  console.log('Opening subscription dialog, packages:', packages);
                  // Reset subscription data
                  setSubscriptionData({
                    packageId: undefined as any,
                    durationDays: 30,
                  });
                  setSubscriptionDialogOpen(true);
                }}
              >
                <CreditCard className="h-4 w-4" />
                إدارة الاشتراك
              </Button>
              {!user.isVerified && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-[12px]"
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending}
                >
                  <ShieldCheck className="h-4 w-4" />
                  توثيق المستخدم
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-[12px]"
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4" />
                تصدير البيانات
              </Button>

              <div className="pt-2 border-t space-y-2">
                {user.isBanned ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-[12px] text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => unbanMutation.mutate()}
                    disabled={unbanMutation.isPending}
                  >
                    <ShieldOff className="h-4 w-4" />
                    إلغاء الحظر
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-[12px] text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => setBanDialogOpen(true)}
                  >
                    <Ban className="h-4 w-4" />
                    حظر المستخدم
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-[12px] text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الحساب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Info */}
          {(() => {
            // Determine if subscription is premium by looking up package
            let isPremium = false;
            if (user.subscription && packages) {
              const packageId = user.subscription.package?.id ||
                              user.subscription.package?._id ||
                              user.subscription.packageId;

              if (packageId) {
                const foundPackage = packages.find(p => (p.id === packageId) || (p._id === packageId));
                isPremium = foundPackage?.type?.toLowerCase() === 'premium';
              }
            }

            return (
              <Card className={`backdrop-blur-sm rounded-[20px] shadow-lg transition-all duration-300 ${
                isPremium
                  ? 'bg-gradient-to-br from-white/90 via-[#4091A5]/10 to-white/90 border-2 border-[#4091A5]/30 shadow-[#4091A5]/20 shadow-2xl relative overflow-hidden'
                  : 'bg-white/80 border-white/20'
              }`}>
                {isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none" />
                )}
                <CardHeader>
                  <CardTitle className={isPremium ? 'flex items-center gap-2 justify-center' : ''}>
                    {isPremium && (
                      <span className="text-2xl animate-pulse">✨</span>
                    )}
                    معلومات الاشتراك
                    {isPremium && (
                      <span className="text-2xl animate-pulse">✨</span>
                    )}
                  </CardTitle>
                </CardHeader>
            <CardContent>
              {!user.subscription || user.subscription.type === 'free' ? (
                <div className="text-center py-6">
                  <Badge variant="secondary" className="text-lg py-2 px-4">مجاني</Badge>
                  <p className="text-sm text-gray-500 mt-3">لم يقم المستخدم بالاشتراك في أي باقة مدفوعة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Package Name & Type */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">الباقة</div>
                      <div className="font-semibold text-lg text-gray-900">
                        {(() => {
                          // Try to get package name from subscription
                          let packageName = user.subscription.package?.name;

                          // If not available, try to find it by packageId from our packages list
                          if (!packageName && packages) {
                            const packageId = user.subscription.package?.id ||
                                            user.subscription.package?._id ||
                                            user.subscription.packageId;

                            console.log('Looking for package with ID:', packageId, 'in packages:', packages);

                            if (packageId) {
                              const foundPackage = packages.find(p =>
                                (p.id === packageId) || (p._id === packageId)
                              );

                              if (foundPackage) {
                                packageName = foundPackage.name;
                                console.log('Found package:', foundPackage);
                              }
                            }
                          }

                          console.log('Final package name:', packageName, 'Subscription data:', user.subscription);

                          return packageName || 'غير محدد';
                        })()}
                      </div>
                    </div>
                    <div>
                      {isPremium ? (
                        <Badge className="relative overflow-hidden bg-gradient-to-r from-[#4091A5] via-[#50a5ba] to-[#4091A5] text-white text-base px-4 py-1 animate-gradient bg-[length:200%_auto] shadow-lg shadow-[#4091A5]/50 animate-shine">
                          <span className="relative z-10 flex items-center gap-1">
                            <span className="animate-pulse">✨</span>
                            مميز
                          </span>
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 text-base px-4 py-1">أساسي</Badge>
                      )}
                    </div>
                  </div>

                  {/* Subscription Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">الحالة</div>
                      <div className="mt-2">
                        {user.subscription.isActive || user.subscription.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-700">نشط</Badge>
                        ) : (
                          <Badge variant="destructive">منتهي</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">تاريخ البدء</div>
                      <div className="mt-2 font-medium text-gray-900">
                        {user.subscription.startDate ? (() => {
                          const date = new Date(user.subscription.startDate);
                          console.log('Start Date - Raw:', user.subscription.startDate, 'Parsed:', date, 'Formatted:', format(date, 'dd/MM/yyyy'));
                          return format(date, 'dd/MM/yyyy');
                        })() : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">تاريخ الانتهاء</div>
                      <div className="mt-2 font-medium text-gray-900">
                        {user.subscription.endDate ? (() => {
                          const date = new Date(user.subscription.endDate);
                          console.log('End Date - Raw:', user.subscription.endDate, 'Parsed:', date, 'Formatted:', format(date, 'dd/MM/yyyy'));
                          return format(date, 'dd/MM/yyyy');
                        })() : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">الأيام المتبقية</div>
                      <div className="mt-2">
                        {(() => {
                          // Calculate days remaining from end date
                          let daysLeft = user.subscription.daysRemaining || 0;

                          // If daysRemaining is 0 but we have an end date, calculate it ourselves
                          if (daysLeft <= 0 && user.subscription.endDate) {
                            const endDate = new Date(user.subscription.endDate);
                            const today = new Date();
                            const diffTime = endDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            daysLeft = diffDays;
                            console.log('Calculated days remaining:', daysLeft, 'End date:', endDate, 'Today:', today);
                          }

                          console.log('Days remaining for user:', daysLeft, 'From backend:', user.subscription.daysRemaining);

                          if (daysLeft > 0) {
                            return (
                              <span className={`font-bold text-lg ${daysLeft <= 7 ? 'text-orange-600' : 'text-[#4091A5]'}`}>
                                {daysLeft} يوم
                              </span>
                            );
                          } else if (daysLeft === 0) {
                            return <span className="text-orange-600 font-medium">ينتهي اليوم</span>;
                          } else {
                            return <span className="text-red-600 font-medium">منتهي</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Days Remaining */}
                  {(() => {
                    // Calculate actual days remaining
                    let daysLeft = user.subscription.daysRemaining || 0;
                    if (daysLeft <= 0 && user.subscription.endDate) {
                      const endDate = new Date(user.subscription.endDate);
                      const today = new Date();
                      const diffTime = endDate.getTime() - today.getTime();
                      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    // Calculate total days from start to end
                    let totalDays = user.subscription.totalDays;
                    if (!totalDays && user.subscription.startDate && user.subscription.endDate) {
                      const startDate = new Date(user.subscription.startDate);
                      const endDate = new Date(user.subscription.endDate);
                      const diffTime = endDate.getTime() - startDate.getTime();
                      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    if (daysLeft > 0 && totalDays > 0) {
                      const percentage = Math.round((daysLeft / totalDays) * 100);
                      return (
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>تقدم الاشتراك</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${daysLeft <= 7 ? 'bg-orange-500' : 'bg-[#4091A5]'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Auto-Renew Status */}
                  {user.subscription.autoRenew !== undefined && (
                    <div className="pt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-500">التجديد التلقائي:</span>
                      {user.subscription.autoRenew ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">مفعّل</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">معطّل</Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
              </Card>
            );
          })()}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[16px] shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4091A5]/10 rounded-[12px]">
                    <Clock className="h-5 w-5 text-[#4091A5]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.stats?.totalListeningTime || 0}</div>
                    <div className="text-xs text-gray-500">دقيقة استماع</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[16px] shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-[12px]">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {user.stats?.favoritesCount || user.stats?.favoriteTracks || 0}
                    </div>
                    <div className="text-xs text-gray-500">عنصر مفضل</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[16px] shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-[12px]">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.stats?.enrolledPrograms || 0}</div>
                    <div className="text-xs text-gray-500">برنامج مسجل</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[16px] shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-[12px]">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {user.stats?.totalPayments || 0}
                    </div>
                    <div className="text-xs text-gray-500">إجمالي المدفوعات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Programs */}
          {user.enrolledPrograms && user.enrolledPrograms.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
              <CardHeader>
                <CardTitle>البرامج المسجلة</CardTitle>
                <CardDescription>البرامج التي سجل فيها المستخدم</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">البرنامج</TableHead>
                      <TableHead className="text-right">التقدم</TableHead>
                      <TableHead className="text-right">الجلسات</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.enrolledPrograms.map((enrollment) => (
                      <TableRow key={enrollment.id || enrollment._id}>
                        <TableCell className="font-medium">
                          {enrollment.program?.title || 'غير متوفر'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-[#4091A5] h-2 rounded-full"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.completedSessions || 0} / {enrollment.totalSessions || 0}
                        </TableCell>
                        <TableCell>
                          {enrollment.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700">مكتمل</Badge>
                          )}
                          {enrollment.status === 'active' && (
                            <Badge className="bg-blue-100 text-blue-700">نشط</Badge>
                          )}
                          {enrollment.status === 'paused' && (
                            <Badge variant="secondary">متوقف</Badge>
                          )}
                          {!enrollment.status && (
                            <Badge variant="secondary">غير محدد</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(enrollment.enrolledAt), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Favorites */}
          {user.favorites && user.favorites.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
              <CardHeader>
                <CardTitle>المفضلات</CardTitle>
                <CardDescription>المقاطع والبرامج المفضلة للمستخدم</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنصر</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المدة</TableHead>
                      <TableHead className="text-right">تاريخ الإضافة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.favorites.map((favorite) => (
                      <TableRow key={favorite.id || favorite._id}>
                        <TableCell className="font-medium">
                          {favorite.item?.title || 'غير متوفر'}
                        </TableCell>
                        <TableCell>
                          {favorite.type === 'track' && (
                            <Badge variant="outline">مقطع صوتي</Badge>
                          )}
                          {favorite.type === 'program' && (
                            <Badge className="bg-purple-100 text-purple-700">برنامج</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {favorite.item?.duration
                            ? `${Math.round(favorite.item.duration / 60)} دقيقة`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(favorite.addedAt), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {user.recentActivity && user.recentActivity.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر 10 جلسات استماع</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المقطع</TableHead>
                      <TableHead className="text-right">المدة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.recentActivity.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.track.title}</TableCell>
                        <TableCell>{Math.round(session.duration / 60)} دقيقة</TableCell>
                        <TableCell>
                          {format(new Date(session.createdAt), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          {session.completed ? (
                            <Badge className="bg-green-100 text-green-700">مكتمل</Badge>
                          ) : (
                            <Badge variant="secondary">غير مكتمل</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Subscription History */}
          {user.subscriptionHistory && user.subscriptionHistory.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
              <CardHeader>
                <CardTitle>سجل الاشتراكات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الباقة</TableHead>
                      <TableHead className="text-right">تاريخ البدء</TableHead>
                      <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.subscriptionHistory.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.package.name}</TableCell>
                        <TableCell>
                          {format(new Date(sub.startDate), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(sub.endDate), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'active' && (
                            <Badge className="bg-green-100 text-green-700">نشط</Badge>
                          )}
                          {sub.status === 'expired' && (
                            <Badge variant="secondary">منتهي</Badge>
                          )}
                          {sub.status === 'cancelled' && (
                            <Badge variant="destructive">ملغي</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* User Activity Chart */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 rounded-[20px] shadow-lg">
            <CardHeader>
              <CardTitle>نشاط الاستماع</CardTitle>
              <CardDescription>دقائق الاستماع اليومية خلال آخر 30 يوماً</CardDescription>
            </CardHeader>
            <CardContent>
              {activityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      label={{ value: 'دقيقة', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontFamily: 'Tajawal',
                      }}
                      labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                      formatter={(value: number) => [`${value} دقيقة`, 'الاستماع']}
                    />
                    <Bar dataKey="minutes" fill="#4091A5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  لا توجد بيانات نشاط حالياً
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل معلومات المستخدم</DialogTitle>
            <DialogDescription>قم بتحديث المعلومات الأساسية للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="rounded-[12px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="rounded-[12px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select
                value={editData.role}
                onValueChange={(value: 'user' | 'admin') => setEditData({ ...editData, role: value })}
              >
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مسؤول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="rounded-[12px]"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending}
              className="rounded-[12px] bg-[#4091A5]"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>منح اشتراك يدوياً</DialogTitle>
            <DialogDescription>قم بمنح المستخدم اشتراك من الباقات المتاحة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {packagesLoading ? (
              <div className="text-center py-4 text-gray-500">جاري تحميل الباقات...</div>
            ) : packagesError ? (
              <div className="text-center py-4 text-red-500">
                خطأ في تحميل الباقات: {(packagesError as any)?.message || 'خطأ غير معروف'}
              </div>
            ) : !packages || packages.length === 0 ? (
              <div className="text-center py-4 text-amber-600">
                لا توجد باقات نشطة متاحة. يرجى إنشاء باقات أولاً من صفحة الباقات.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="packageId">الباقة</Label>
                  <Select
                    value={subscriptionData.packageId}
                    onValueChange={(value) => {
                      console.log('Package selected:', value);
                      const selectedPackage = packages?.find(p => (p._id || p.id) === value);
                      console.log('Selected package object:', selectedPackage);
                      const days = selectedPackage?.durationDays ||
                                   (selectedPackage?.period === 'سنة' ? 365 : 30);
                      const newData = {
                        ...subscriptionData,
                        packageId: value,
                        durationDays: days
                      };
                      console.log('New subscription data:', newData);
                      setSubscriptionData(newData);
                    }}
                  >
                    <SelectTrigger className="rounded-[12px]">
                      <SelectValue placeholder="اختر الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages && packages.length > 0 ? (
                        packages.map((pkg) => {
                          const pkgId = pkg._id || pkg.id;
                          return (
                            <SelectItem key={pkgId} value={pkgId}>
                              {pkg.name} - {pkg.price} {pkg.currency || 'ج.م'}
                              {pkg.durationDays && ` / ${pkg.durationDays} يوم`}
                              {!pkg.durationDays && pkg.period && ` / ${pkg.period}`}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem key="none" value="none" disabled>
                          لا توجد باقات متاحة
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!subscriptionData.packageId && !packagesLoading && (
                    <div className="text-xs text-red-500">
                      يرجى اختيار باقة
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">المدة (بالأيام)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={subscriptionData.durationDays}
                    onChange={(e) =>
                      setSubscriptionData({ ...subscriptionData, durationDays: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-[12px]"
                    min="1"
                  />
                  <div className="text-xs text-gray-500">
                    يمكنك تعديل المدة حسب الحاجة (افتراضياً حسب الباقة)
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">السبب (اختياري)</Label>
                  <Textarea
                    id="reason"
                    value={subscriptionData.reason || ''}
                    onChange={(e) => setSubscriptionData({ ...subscriptionData, reason: e.target.value })}
                    className="rounded-[12px]"
                    placeholder="مثال: هدية، تعويض، إلخ..."
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubscriptionDialogOpen(false)}
              className="rounded-[12px]"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                console.log('Grant button clicked, data:', subscriptionData);
                handleGrantSubscription();
              }}
              disabled={(() => {
                const isDisabled = grantSubscriptionMutation.isPending || !subscriptionData.packageId;
                console.log('Button disabled?', isDisabled, 'isPending:', grantSubscriptionMutation.isPending, 'packageId:', subscriptionData.packageId);
                return isDisabled;
              })()}
              className="rounded-[12px] bg-[#4091A5]"
            >
              منح الاشتراك
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>حظر المستخدم</DialogTitle>
            <DialogDescription>حظر المستخدم من استخدام التطبيق</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="banReason">سبب الحظر</Label>
              <Textarea
                id="banReason"
                value={banData.reason}
                onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                className="rounded-[12px]"
                placeholder="أدخل سبب الحظر..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">المدة (بالأيام، اتركها فارغة للحظر الدائم)</Label>
              <Input
                id="duration"
                type="number"
                value={banData.duration || ''}
                onChange={(e) =>
                  setBanData({ ...banData, duration: e.target.value ? parseInt(e.target.value) : undefined, permanent: !e.target.value })
                }
                className="rounded-[12px]"
                placeholder="اتركه فارغاً للحظر الدائم"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              className="rounded-[12px]"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={banMutation.isPending || !banData.reason}
              className="rounded-[12px] bg-orange-600 hover:bg-orange-700"
            >
              حظر المستخدم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الحساب؟</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل دائم.</p>
              <div className="space-y-2">
                <Label>اكتب اسم المستخدم للتأكيد: <span className="font-bold">{user.name}</span></Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="rounded-[12px]"
                  placeholder="اكتب اسم المستخدم هنا"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteConfirmText !== user.name || deleteMutation.isPending}
              className="rounded-[12px] bg-red-600 hover:bg-red-700"
            >
              حذف الحساب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
