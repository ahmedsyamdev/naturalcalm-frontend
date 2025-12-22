/**
 * Admin Packages Management Page
 * Displays subscription packages with analytics and edit functionality
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSubscriptionService } from '@/lib/api/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package as PackageType } from '@/types';
import { Edit, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { EditPackageDialog } from '@/components/admin/EditPackageDialog';

export default function Packages() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => AdminSubscriptionService.getPackages(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: () => AdminSubscriptionService.getSubscriptionStats(),
  });

  const handleEditClick = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsEditDialogOpen(true);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numPrice.toLocaleString('ar-EG')} ر.س`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
            إدارة الباقات
          </h1>
          <p className="text-slate-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            عرض وتعديل باقات الاشتراك والإحصائيات
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : stats ? (
          <>
            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                    إجمالي الاشتراكات النشطة
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  {stats.totalActiveSubscriptions.toLocaleString('ar-EG')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                    اشتراكات أساسية
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  {stats.basicSubscriptions.toLocaleString('ar-EG')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                    اشتراكات قياسية
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  {(stats.standardSubscriptions || 0).toLocaleString('ar-EG')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                    اشتراكات مميزة
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  {stats.premiumSubscriptions.toLocaleString('ar-EG')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                    الإيرادات الشهرية
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  {formatPrice(stats.monthlyRecurringRevenue)}
                </div>
                <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Tajawal' }}>
                  الإيرادات السنوية: {formatPrice(stats.annualRecurringRevenue)}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packagesLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : packages && packages.length > 0 ? (
          packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                      {pkg.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={pkg.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                        style={{ fontFamily: 'Tajawal' }}
                      >
                        {pkg.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs" style={{ fontFamily: 'Tajawal' }}>
                          {pkg.period}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(pkg)}
                    className="hover:bg-white/60"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary" style={{ fontFamily: 'Tajawal' }}>
                      {formatPrice(pkg.price)}
                    </span>
                    {pkg.discount && (
                      <Badge variant="destructive" className="text-xs" style={{ fontFamily: 'Tajawal' }}>
                        خصم {pkg.discount}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
                    المميزات:
                  </p>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-600 flex items-start gap-2"
                        style={{ fontFamily: 'Tajawal' }}
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-white/40 backdrop-blur-md border-white/60 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                لا توجد باقات متاحة
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Package Dialog */}
      {selectedPackage && (
        <EditPackageDialog
          package={selectedPackage}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
