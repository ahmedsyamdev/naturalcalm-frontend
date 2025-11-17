/**
 * Admin Users Management Page
 * Complete user management interface with search, filters, and actions
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminUserService, type UserFilters, type AdminUser, AdminSubscriptionServiceDefault } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  CreditCard,
  ShieldCheck,
  Ban,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Users() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [banUserId, setBanUserId] = useState<string | null>(null);

  const [filters, setFilters] = useState<UserFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 50,
    search: searchParams.get('search') || '',
    role: (searchParams.get('role') as 'user' | 'admin') || undefined,
    isVerified: searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined,
    subscription: (searchParams.get('subscription') as any) || undefined,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => AdminUserService.getUsers(filters),
  });

  // Fetch packages for displaying package names
  const { data: packages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => AdminSubscriptionServiceDefault.getPackages(),
  });

  const updateFilters = (updates: Partial<UserFilters>) => {
    const newFilters = { ...filters, ...updates, page: updates.page !== undefined ? updates.page : 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.role) params.set('role', newFilters.role);
    if (newFilters.isVerified !== undefined) params.set('verified', String(newFilters.isVerified));
    if (newFilters.subscription) params.set('subscription', newFilters.subscription);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    setSearchParams(params);
  };

  const getSubscriptionBadge = (user: any) => {
    // Check if user has no subscription or it's free
    if (!user.subscription || user.subscription.type === 'free') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">مجاني</Badge>;
    }

    // Debug: Log the actual subscription data
    console.log('User subscription data:', {
      userId: user.id,
      userName: user.name,
      type: user.subscription.type,
      packageId: user.subscription.packageId,
      fullSubscription: user.subscription
    });

    // Check if user has packageId or endDate - means they have/had a subscription
    const hasSubscription = user.subscription.packageId ||
                           user.subscription.package?.id ||
                           user.subscription.package?._id ||
                           user.subscription.endDate;

    // If no subscription data at all, show free
    if (!hasSubscription && !user.subscription.type) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">مجاني</Badge>;
    }

    // Get package to determine type if subscription.type is not reliable
    let packageType = null;
    if (packages && user.subscription.packageId) {
      const foundPackage = packages.find(p =>
        (p.id === user.subscription.packageId) || (p._id === user.subscription.packageId)
      );
      if (foundPackage) {
        packageType = foundPackage.type; // 'basic' or 'premium'
        console.log('Found package type from packages list:', packageType, 'for package:', foundPackage.name);
      }
    }

    // Use package type if available, otherwise use subscription type
    const subType = (packageType || user.subscription.type)?.toLowerCase();

    console.log('Final subscription type used for badge:', subType);

    if (subType === 'basic') {
      return <Badge className="bg-blue-100 text-blue-700">أساسي</Badge>;
    }

    if (subType === 'premium') {
      return (
        <Badge className="relative overflow-hidden bg-gradient-to-r from-[#4091A5] via-[#50a5ba] to-[#4091A5] text-white animate-gradient bg-[length:200%_auto] shadow-lg shadow-[#4091A5]/50 animate-shine">
          <span className="relative z-10 flex items-center gap-1">
            <span className="animate-pulse">✨</span>
            مميز
          </span>
        </Badge>
      );
    }

    // If we have subscription data but type is not recognized
    if (hasSubscription) {
      console.warn('Unknown subscription type:', user.subscription.type, 'packageType:', packageType, 'User:', user.id);
      return <Badge className="bg-blue-100 text-blue-700">أساسي</Badge>;
    }

    // Final fallback to free
    return <Badge variant="secondary" className="bg-gray-100 text-gray-700">مجاني</Badge>;
  };

  const getSubscriptionDetails = (user: any) => {
    // No subscription or free subscription - don't show details
    if (!user.subscription || user.subscription.type === 'free') {
      return null;
    }

    // Calculate days remaining
    let daysRemaining = user.subscription.daysRemaining || 0;
    const endDate = user.subscription.endDate;

    // If daysRemaining is not provided but we have endDate, calculate it
    if (daysRemaining <= 0 && endDate) {
      const end = new Date(endDate);
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Try to get package name
    let packageName = user.subscription.package?.name;

    // If not available, find it from packages list
    if (!packageName && packages) {
      const packageId = user.subscription.package?.id ||
                        user.subscription.package?._id ||
                        user.subscription.packageId;

      if (packageId) {
        const foundPackage = packages.find(p =>
          (p.id === packageId) || (p._id === packageId)
        );
        if (foundPackage) {
          packageName = foundPackage.name;
        }
      }
    }

    const isActive = user.subscription.status === 'active' || user.subscription.isActive;
    const isExpired = !isActive || daysRemaining <= 0;

    // Only show details if there's actually a paid subscription (not expired without history)
    if (isExpired && !packageName && !endDate) {
      return null;
    }

    return (
      <div className="text-xs mt-1 space-y-0.5">
        {packageName && (
          <div className="text-gray-600 font-medium">
            {packageName}
          </div>
        )}
        {isExpired ? (
          <span className="text-red-600 font-medium">منتهي</span>
        ) : (
          <>
            {daysRemaining > 0 && (
              <div className="flex items-center gap-1">
                <span className={daysRemaining <= 7 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                  {daysRemaining} يوم متبقي
                </span>
              </div>
            )}
            {endDate && (
              <div className="text-gray-400">
                حتى {format(new Date(endDate), 'dd/MM/yyyy')}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const getVerifiedBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-700">موثق</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">غير موثق</Badge>
    );
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const verifyMutation = useMutation({
    mutationFn: (userId: string) => AdminUserService.updateUser(userId, { isVerified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'تم توثيق المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل توثيق المستخدم', variant: 'destructive' });
    },
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => AdminUserService.banUser(userId, { reason: 'تم الحظر من قائمة المستخدمين', permanent: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'تم حظر المستخدم بنجاح' });
      setBanUserId(null);
    },
    onError: () => {
      toast({ title: 'فشل حظر المستخدم', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => AdminUserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'تم حذف المستخدم بنجاح' });
      setDeleteUserId(null);
    },
    onError: () => {
      toast({ title: 'فشل حذف المستخدم', variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (userId: string) => AdminUserService.exportUserData(userId),
    onSuccess: (blob, userId) => {
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await Promise.all(userIds.map(id => AdminUserService.deleteUser(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: `تم حذف ${selectedUsers.length} مستخدم بنجاح` });
      setSelectedUsers([]);
    },
    onError: () => {
      toast({ title: 'فشل حذف المستخدمين', variant: 'destructive' });
    },
  });

  const bulkBanMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await Promise.all(userIds.map(id => AdminUserService.banUser(id, { reason: 'حظر جماعي', permanent: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: `تم حظر ${selectedUsers.length} مستخدم بنجاح` });
      setSelectedUsers([]);
    },
    onError: () => {
      toast({ title: 'فشل حظر المستخدمين', variant: 'destructive' });
    },
  });

  const bulkExportMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const exports = await Promise.all(userIds.map(id => AdminUserService.exportUserData(id)));
      return exports;
    },
    onSuccess: (blobs) => {
      blobs.forEach((blob, index) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${selectedUsers[index]}-data.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
      toast({ title: `تم تصدير بيانات ${selectedUsers.length} مستخدم بنجاح` });
      setSelectedUsers([]);
    },
    onError: () => {
      toast({ title: 'فشل تصدير البيانات', variant: 'destructive' });
    },
  });

  const toggleSelectAll = () => {
    if (selectedUsers.length === data?.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data?.users.map(u => u.id) || []);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6" dir="rtl" style={{ fontFamily: 'Tajawal' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">إدارة المستخدمين</h1>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedUsers.length > 0 && (
        <div className="backdrop-blur-sm bg-[#4091A5]/10 rounded-[20px] shadow-lg border border-[#4091A5]/20 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[#4091A5]">
              تم تحديد {selectedUsers.length} مستخدم
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkExportMutation.mutate(selectedUsers)}
                disabled={bulkExportMutation.isPending}
                className="rounded-[12px]"
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير المحدد
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkBanMutation.mutate(selectedUsers)}
                disabled={bulkBanMutation.isPending}
                className="rounded-[12px] text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Ban className="ml-2 h-4 w-4" />
                حظر المحدد
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkDeleteMutation.mutate(selectedUsers)}
                disabled={bulkDeleteMutation.isPending}
                className="rounded-[12px] text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف المحدد
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section - Liquid Glass Design */}
      <div className="backdrop-blur-sm bg-white/80 rounded-[20px] shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث بالاسم، الهاتف أو البريد..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pr-10 rounded-[12px] border-gray-200"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => updateFilters({ role: value === 'all' ? undefined : value as 'user' | 'admin' })}
          >
            <SelectTrigger className="rounded-[12px]">
              <SelectValue placeholder="الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="user">مستخدم</SelectItem>
              <SelectItem value="admin">مسؤول</SelectItem>
            </SelectContent>
          </Select>

          {/* Verified Filter */}
          <Select
            value={filters.isVerified === undefined ? 'all' : String(filters.isVerified)}
            onValueChange={(value) => updateFilters({ isVerified: value === 'all' ? undefined : value === 'true' })}
          >
            <SelectTrigger className="rounded-[12px]">
              <SelectValue placeholder="حالة التوثيق" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="true">موثق</SelectItem>
              <SelectItem value="false">غير موثق</SelectItem>
            </SelectContent>
          </Select>

          {/* Subscription Filter */}
          <Select
            value={filters.subscription || 'all'}
            onValueChange={(value) => updateFilters({ subscription: value === 'all' ? undefined : value as any })}
          >
            <SelectTrigger className="rounded-[12px]">
              <SelectValue placeholder="نوع الاشتراك" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="free">مجاني</SelectItem>
              <SelectItem value="basic">أساسي</SelectItem>
              <SelectItem value="premium">مميز</SelectItem>
              <SelectItem value="expired">منتهي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table - Liquid Glass Design */}
      <div className="backdrop-blur-sm bg-white/80 rounded-[20px] shadow-lg border border-white/20 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
        ) : !data?.users?.length ? (
          <div className="p-12 text-center text-gray-500">لا توجد نتائج</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === data.users.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الاشتراك</TableHead>
                  <TableHead className="text-right">التوثيق</TableHead>
                  <TableHead className="text-right">تاريخ الانضمام</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-[#4091A5] text-white">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.role === 'admin' && (
                            <Badge variant="outline" className="text-xs mt-1">مسؤول</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-gray-600 cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      {user.phone}
                    </TableCell>
                    <TableCell
                      className="text-gray-600 cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      {user.email || '-'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      <div>
                        {getSubscriptionBadge(user)}
                        {getSubscriptionDetails(user)}
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      {getVerifiedBadge(user.isVerified)}
                    </TableCell>
                    <TableCell
                      className="text-gray-600 cursor-pointer"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل المستخدم
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                              <CreditCard className="ml-2 h-4 w-4" />
                              إدارة الاشتراك
                            </DropdownMenuItem>
                            {!user.isVerified && (
                              <DropdownMenuItem onClick={() => verifyMutation.mutate(user.id)}>
                                <ShieldCheck className="ml-2 h-4 w-4" />
                                توثيق المستخدم
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => exportMutation.mutate(user.id)}>
                              <Download className="ml-2 h-4 w-4" />
                              تصدير البيانات
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-orange-600"
                              onClick={() => setBanUserId(user.id)}
                            >
                              <Ban className="ml-2 h-4 w-4" />
                              حظر المستخدم
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف الحساب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  عرض {data.users.length} من أصل {data.pagination.total} مستخدم
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ page: filters.page! - 1 })}
                    disabled={filters.page === 1}
                    className="rounded-[12px]"
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <div className="text-sm text-gray-600">
                    صفحة {data.pagination.page} من {data.pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ page: filters.page! + 1 })}
                    disabled={filters.page === data.pagination.totalPages}
                    className="rounded-[12px]"
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ban User Dialog */}
      <AlertDialog open={!!banUserId} onOpenChange={() => setBanUserId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حظر المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حظر هذا المستخدم؟ سيتم منعه من الوصول إلى التطبيق.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banUserId && banMutation.mutate(banUserId)}
              disabled={banMutation.isPending}
              className="rounded-[12px] bg-orange-600 hover:bg-orange-700"
            >
              حظر المستخدم
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع بيانات المستخدم بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteMutation.mutate(deleteUserId)}
              disabled={deleteMutation.isPending}
              className="rounded-[12px] bg-red-600 hover:bg-red-700"
            >
              حذف المستخدم
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
