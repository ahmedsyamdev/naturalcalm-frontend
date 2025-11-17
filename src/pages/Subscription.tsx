/**
 * Subscription Page
 * Display subscription packages and manage user subscription
 */

import { ArrowRight, Bell, Heart, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import { useCurrentSubscription, usePackages } from "@/hooks/queries/useSubscription";
import { Package } from "@/types";

const Subscription = () => {
  const navigate = useNavigate();
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useCurrentSubscription();
  const { data: packages = [], isLoading: isLoadingPackages } = usePackages();
  const hasActiveSubscription = !!currentSubscription;

  // Get package details from populated packageId
  const getPackageDetails = () => {
    if (!currentSubscription || typeof currentSubscription.packageId === 'string') {
      return null;
    }
    return currentSubscription.packageId as Package;
  };

  const packageDetails = getPackageDetails();

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency?: string) => {
    const currencyMap: Record<string, string> = {
      'USD': '$',
      'SAR': 'ر.س',
      'AED': 'د.إ',
      'EGP': 'ج.م',
    };
    return currencyMap[currency || 'SAR'] || 'ر.س';
  };

  // Helper function to check if package is premium
  const isPremiumPackage = (pkgName: string) => {
    return pkgName?.toLowerCase().includes('premium') ||
           pkgName?.toLowerCase().includes('بريميوم') ||
           pkgName?.toLowerCase().includes('متميز');
  };

  // Calculate total days from package duration
  const getTotalDays = () => {
    if (!packageDetails) return 0;
    return packageDetails.durationDays || 0;
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-primary" />
              </button>
            <button
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-primary" />
            </button>
            </div>
            <h1 className="text-xl font-bold flex-1 text-center">الباقات</h1>
            <button onClick={() => navigate(-1)}>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Current Subscription */}
        {isLoadingSubscription ? (
          <div>
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        ) : hasActiveSubscription && currentSubscription && packageDetails ? (
          <div>
            <h2 className="text-lg font-bold mb-4 text-right">باقتك</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  {packageDetails.discount && (
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      {packageDetails.discount}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">
                      {packageDetails.name}
                    </h3>
                    <span className="text-xl">💎</span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Price */}
                <div className="flex items-center justify-end gap-2">
                  <p className="text-2xl font-bold text-primary">
                    {typeof packageDetails.price === 'number'
                      ? packageDetails.price
                      : parseFloat(packageDetails.price as string)}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {getCurrencySymbol(packageDetails.currency)}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      متبقي {currentSubscription.daysRemaining} يوم
                    </p>
                    <p className="text-muted-foreground">
                      من أصل {getTotalDays()} يوم
                    </p>
                  </div>
                  <Progress
                    value={getTotalDays() > 0 ? (currentSubscription.daysRemaining / getTotalDays()) * 100 : 0}
                    className="h-3"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-base font-semibold">
                      {new Date(currentSubscription.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">تاريخ الانتهاء</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-base font-semibold">
                      {new Date(currentSubscription.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">تاريخ الاشتراك</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 text-center">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="font-bold text-lg mb-2">لا يوجد اشتراك نشط</h3>
            <p className="text-sm text-muted-foreground mb-4">
              اشترك الآن للوصول الى جميع المحتويات المميزة
            </p>
          </div>
        )}

        {/* Available Packages */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-right">الباقات</h2>
          {isLoadingPackages ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden p-4 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => {
                const isCurrentPackage = currentSubscription &&
                  packageDetails &&
                  (packageDetails.id === pkg.id || packageDetails._id === pkg._id);
                const isPremium = isPremiumPackage(pkg.name);

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl shadow-md overflow-hidden relative transition-all duration-300 ${
                      isPremium
                        ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white border-2 border-primary/30 hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-white hover:shadow-lg'
                    }`}
                  >
                    {/* Premium Sparkles Animation */}
                    {isPremium && (
                      <>
                        <div className="absolute top-3 left-3 animate-pulse">
                          <Sparkles className="w-5 h-5 text-white/80" />
                        </div>
                        <div className="absolute top-3 right-3 animate-pulse delay-100">
                          <Sparkles className="w-4 h-4 text-white/60" />
                        </div>
                        <div className="absolute bottom-3 left-3 animate-pulse delay-200">
                          <Sparkles className="w-4 h-4 text-white/60" />
                        </div>
                        {/* Shimmer effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </>
                    )}

                    <div className="p-5 space-y-4 relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          isPremium
                            ? 'bg-white/20 text-white backdrop-blur-sm'
                            : pkg.discount
                              ? 'bg-green-500 text-white'
                              : 'bg-primary/10 text-primary'
                        }`}>
                          {pkg.discount || (isPremium ? "الأكثر شعبية" : "العرض الأساسي")}
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                            {pkg.name}
                          </h3>
                          <span className="text-xl">{isPremium ? '✨' : '💎'}</span>
                        </div>
                      </div>

                      <div className={`h-px ${isPremium ? 'bg-white/30' : 'bg-border'}`} />

                      {/* Price & Duration */}
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-end gap-2">
                          <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {pkg.period && `/ ${pkg.period}`}
                          </span>
                          <p className={`text-3xl font-bold ${isPremium ? 'text-white' : 'text-primary'}`}>
                            {typeof pkg.price === 'number' ? pkg.price : parseFloat(pkg.price as string)}
                          </p>
                          <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {getCurrencySymbol(pkg.currency)}
                          </span>
                        </div>
                        {pkg.durationDays && (
                          <div className="flex items-center justify-end">
                            <p className={`text-sm font-medium ${isPremium ? 'text-white/90' : 'text-muted-foreground'}`}>
                              مدة الاشتراك: {pkg.durationDays} يوم
                            </p>
                          </div>
                        )}
                      </div>

                      <div className={`h-px ${isPremium ? 'bg-white/30' : 'bg-border'}`} />

                      {/* Features */}
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="space-y-2.5">
                          {pkg.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 justify-end">
                              <span className={`text-sm ${isPremium ? 'text-white' : 'text-gray-700'}`}>
                                {feature}
                              </span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                isPremium ? 'bg-white/20 backdrop-blur-sm' : 'bg-green-500'
                              }`}>
                                <Check className={`w-3 h-3 ${isPremium ? 'text-white' : 'text-white'}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Subscribe Button */}
                      <Button
                        onClick={() => navigate("/payment", { state: { selectedPackage: pkg } })}
                        disabled={isCurrentPackage}
                        className={`w-full rounded-full h-12 font-bold text-base transition-all ${
                          isPremium
                            ? 'bg-white hover:bg-white/90 text-primary shadow-lg hover:shadow-xl'
                            : 'bg-primary hover:bg-primary/90 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isCurrentPackage ? "مشترك حالياً" : "اشترك الان"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Add keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Subscription;
