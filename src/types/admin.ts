/**
 * Admin panel TypeScript types
 */

import { User, Track, Program, Subscription, Category } from './index';

export interface AdminUser extends User {
  role: 'admin' | 'user';
  createdAt?: string;
  lastLogin?: string;
}

export interface AdminLoginCredentials {
  identifier: string; // phone or email
  password: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalTracks: number;
  totalPrograms: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenue: {
    monthly: number;
    yearly: number;
  };
  recentUsers: AdminUser[];
  popularTracks: Track[];
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  totalPrograms: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trends?: {
    users?: number;
    revenue?: number;
    subscriptions?: number;
  };
}

export interface AdminSidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminFilters {
  search?: string;
  category?: string;
  level?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  date: string;
  users: number;
  tracks: number;
  revenue: number;
}
