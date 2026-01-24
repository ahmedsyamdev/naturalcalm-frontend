/**
 * Profile Page
 * User account management, statistics, and settings
 */

import { useState } from "react";
import { ArrowRight, Bell, Heart, UserPen, Smartphone, LogOut, Trash2, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useStats, useWeeklyStats } from "@/hooks/queries/useStats";
import { AuthService } from "@/lib/api/services/AuthService";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyStats();

  const menuItems = [
    {
      icon: <UserPen className="w-6 h-6" />,
      label: "تعديل حسابك",
      onClick: () => setShowEditDialog(true),
    },
    {
      icon: <Download className="w-6 h-6" />,
      label: "التنزيلات",
      onClick: () => navigate("/downloads"),
    },
    {
      icon: <span className="text-xl">👥</span>,
      label: "دعوة صديق (قريباً)",
      onClick: () => toast.error("هذه الميزة غير متوفرة حالياً"),
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      label: "عن التطبيق",
      onClick: () => setShowAboutDialog(true),
    },
    {
      icon: <span className="text-xl">❓</span>,
      label: "المساعدة والدعم",
      onClick: () => setShowHelpDialog(true),
    },
    {
      icon: <span className="text-xl">🔒</span>,
      label: "خصوصية الاستخدام",
      onClick: () => setShowPrivacyDialog(true),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await AuthService.deleteAccount();
      toast.success("تم حذف حسابك بنجاح");
      navigate("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("حدث خطأ أثناء حذف الحساب");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const dangerItems = [
    {
      icon: <Trash2 className="w-6 h-6" />,
      label: "حذف الحساب",
      onClick: () => setShowDeleteDialog(true),
    },
    {
      icon: <LogOut className="w-6 h-6" />,
      label: "تسجيل خروج",
      onClick: () => setShowLogoutDialog(true),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
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
            <div className="text-right flex-1 mx-4">
              <h1 className="text-xl font-bold">اهلا بك {user?.name}!</h1>
              <p className="text-sm text-muted-foreground">استعد لتجديد طاقتك وتهدئة عقلك...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Progress Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-right">تقدمك خلال هذا الشهر</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {statsLoading ? (
              <>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
              </>
            ) : statsError ? (
              <div className="col-span-3 bg-white rounded-2xl p-4 text-center shadow-sm">
                <p className="text-sm text-red-600">فشل تحميل الإحصائيات</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-primary">{stats?.totalMinutes || 0}</p>
                  <p className="text-sm text-muted-foreground">دقيقة</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-primary">{stats?.totalPrograms || 0}</p>
                  <p className="text-sm text-muted-foreground">مسارات</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-primary">{stats?.totalTracks || 0}</p>
                  <p className="text-sm text-muted-foreground">صوت</p>
                </div>
              </>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {weeklyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[250px] w-full" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ) : !weeklyData || weeklyData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">لا توجد بيانات لهذا الشهر</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: '#666', fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#666', fontSize: 11 }}
                      tickLine={false}
                    />
                    <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#4091a5" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  نسبة استماع الاصوات
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="w-6 h-6 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-red-100">
          <div className="divide-y">
            {dangerItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-50 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-red-600">{item.label}</span>
                  <div className="w-6 h-6 flex items-center justify-center text-red-600">
                    {item.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <EditProfileDialog open={showEditDialog} onOpenChange={setShowEditDialog} />

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>عن التطبيق</DialogTitle>
            <DialogDescription>
              Naturacalm - تطبيق التأمل والاسترخاء
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Naturacalm هو تطبيقك المثالي للتأمل والاسترخاء، يوفر لك مجموعة واسعة من المسارات الصوتية والبرامج المتخصصة لمساعدتك على تحقيق السلام الداخلي والهدوء النفسي.
            </p>
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">الإصدار 1.0.0</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>المساعدة والدعم</DialogTitle>
            <DialogDescription>
              نحن هنا لمساعدتك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">التواصل معنا</h3>
              <p className="text-sm text-muted-foreground mb-2">
                للاستفسارات والدعم الفني، يمكنك التواصل معنا عبر:
              </p>
              <ul className="space-y-2 text-sm">
                <li>📧 البريد الإلكتروني: support@naturacalm.com</li>
                <li>📱 الهاتف: +966 XX XXX XXXX</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">الأسئلة الشائعة</h3>
              <p className="text-sm text-muted-foreground">
                للاطلاع على الأسئلة الشائعة وحلول المشاكل الشائعة، يرجى زيارة موقعنا الإلكتروني.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>خصوصية الاستخدام</DialogTitle>
            <DialogDescription>
              سياسة الخصوصية وشروط الاستخدام
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">جمع المعلومات</h3>
              <p className="text-muted-foreground">
                نقوم بجمع المعلومات التي تقدمها لنا عند التسجيل في التطبيق، بما في ذلك الاسم ورقم الهاتف والبريد الإلكتروني.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">استخدام المعلومات</h3>
              <p className="text-muted-foreground">
                نستخدم معلوماتك لتقديم خدماتنا وتحسين تجربتك في التطبيق. لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">حماية البيانات</h3>
              <p className="text-muted-foreground">
                نتخذ إجراءات أمنية صارمة لحماية بياناتك الشخصية من الوصول غير المصرح به.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في تسجيل الخروج؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              تسجيل الخروج
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الحساب</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>هل أنت متأكد من رغبتك في حذف حسابك؟</p>
              <p className="font-semibold text-red-600">
                هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف الحساب نهائياً"
              )}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Profile;

