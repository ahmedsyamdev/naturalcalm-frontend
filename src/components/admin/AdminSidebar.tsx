/**
 * AdminSidebar Component
 * Glassmorphism sidebar with RTL Arabic support and app colors
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Music,
  ListVideo,
  Users,
  CreditCard,
  Ticket,
  DollarSign,
  Bell,
  Settings,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'categories',
    label: 'التصنيفات',
    path: '/admin/categories',
    icon: FolderTree,
  },
  {
    id: 'tracks',
    label: 'المقاطع الصوتية',
    path: '/admin/tracks',
    icon: Music,
  },
  {
    id: 'programs',
    label: 'البرامج',
    path: '/admin/programs',
    icon: ListVideo,
  },
  {
    id: 'users',
    label: 'المستخدمين',
    path: '/admin/users',
    icon: Users,
  },
  {
    id: 'subscriptions',
    label: 'الباقات',
    path: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    id: 'coupons',
    label: 'الكوبونات',
    path: '/admin/coupons',
    icon: Ticket,
  },
  {
    id: 'payments',
    label: 'المدفوعات',
    path: '/admin/payments',
    icon: DollarSign,
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    path: '/admin/notifications',
    icon: Bell,
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Glassmorphism Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0 h-screen z-50 transition-all duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          w-64
        `}
        dir="rtl"
      >
        {/* Glass Background with App Primary Color Tint */}
        <div className="h-screen bg-gradient-to-b from-[#4091A5]/95 to-[#535353]/95 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Tajawal' }}>
                Naturacalm
              </h1>
              <p className="text-xs text-white/70 mt-1" style={{ fontFamily: 'Tajawal' }}>
                لوحة التحكم
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-lg hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <style dangerouslySetInnerHTML={{__html: `
              nav::-webkit-scrollbar {
                width: 6px;
              }
              nav::-webkit-scrollbar-track {
                background: transparent;
              }
              nav::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
              }
              nav::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}} />
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent'
                    }`
                  }
                  style={{ fontFamily: 'Tajawal' }}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`${isActive ? 'bg-white/20' : 'bg-white/10'} p-2 rounded-lg group-hover:bg-white/20 transition-colors`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/10 flex-shrink-0">
            <div className="text-xs text-white/60 text-center space-y-1" style={{ fontFamily: 'Tajawal' }}>
              <div>© 2025 Naturacalm</div>
              <div className="flex items-center justify-center gap-1">
                <span>صُنع بـ</span>
                <span className="text-red-400 animate-pulse">❤️</span>
                <span>بواسطة</span>
                <a
                  href="https://www.qeematech.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors underline underline-offset-2"
                >
                  قيمة تك
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
