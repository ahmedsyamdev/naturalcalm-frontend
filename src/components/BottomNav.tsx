import { Home, Heart, Search, User, Music } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInfiniteNotifications } from "@/hooks/queries/useNotifications";
import { useMemo } from "react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notificationsData } = useInfiniteNotifications(20);

  // Get all unread notifications
  const unreadNotifications = useMemo(() => {
    if (!notificationsData) return [];
    return notificationsData.pages
      .flatMap((page) => page.data)
      .filter((notification) => !notification.isRead);
  }, [notificationsData]);

  // Check if there are program-related notifications
  const hasProgramNotifications = useMemo(() => {
    return unreadNotifications.some(
      (notification) =>
        notification.type === 'achievement' ||
        notification.data?.programId
    );
  }, [unreadNotifications]);

  // Check if there are profile-related notifications
  const hasProfileNotifications = useMemo(() => {
    return unreadNotifications.some(
      (notification) => notification.type === 'subscription'
    );
  }, [unreadNotifications]);

  const navItems = [
    { icon: Home, label: "الرئيسية", path: "/home", showDot: false },
    { icon: Search, label: "اكتشف", path: "/search", showDot: false },
    { icon: Music, label: "مساراتي", path: "/my-programs", showDot: hasProgramNotifications },
    { icon: User, label: "حسابي", path: "/profile", showDot: hasProfileNotifications },
  ];

  return (
    <div className="fixed bottom-[30px] left-5 right-5 z-50" dir="rtl">
      <div className="bg-primary rounded-[25px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-around py-3 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 min-w-[60px] relative"
              >
                {/* Notification Dot Indicator */}
                {item.showDot && (
                  <div className="absolute top-0 right-[18px] w-2 h-2 bg-red-500 rounded-full border-2 border-primary" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                />
                <span
                  className={`text-xs transition-colors ${
                    isActive ? "text-white font-medium" : "text-white/60"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
