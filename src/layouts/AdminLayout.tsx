/**
 * AdminLayout Component
 * Main layout wrapper for admin pages with sidebar and header
 */

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Glass Effect */}
        <header className="bg-white/70 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 hover:text-slate-900 transition-colors bg-white/50 p-2 rounded-lg hover:bg-white/80"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="text-right" style={{ fontFamily: 'Tajawal' }}>
                    <div className="text-sm font-bold text-slate-900">{user?.name || 'المسؤول'}</div>
                    <div className="text-xs text-slate-600">مسؤول</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4091A5] to-[#535353] flex items-center justify-center text-white shadow-lg">
                    <User className="h-5 w-5" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-lg border-white/50" style={{ fontFamily: 'Tajawal' }}>
                <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center gap-2 justify-end"
                >
                  <span>تسجيل الخروج</span>
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer with Glass Effect */}
        <footer className="bg-white/50 backdrop-blur-lg border-t border-white/20 py-4 px-6">
          <div className="text-sm text-slate-600 text-center space-y-1" style={{ fontFamily: 'Tajawal' }}>
            <p>© 2025 Naturacalm. جميع الحقوق محفوظة.</p>
            <p className="flex items-center justify-center gap-1">
              <span>صُنع بـ</span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span>بواسطة</span>
              <a
                href="https://www.qeematech.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4091A5] hover:text-[#357a8a] transition-colors underline underline-offset-2"
              >
                قيمة تك
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
