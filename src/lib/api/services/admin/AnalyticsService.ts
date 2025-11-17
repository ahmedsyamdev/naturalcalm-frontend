/**
 * Admin Analytics Service
 * Handles fetching dashboard metrics, charts data, and analytics
 */

import { BaseService } from '../../BaseService';
import { ApiResponse } from '../../types';
import { Track } from '@/types';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  totalPrograms: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trends: {
    users: number;
    revenue: number;
    subscriptions: number;
  };
}

export interface UserGrowthData {
  date: string;
  count: number;
  label: string;
}

export interface RevenueData {
  date: string;
  amount: number;
  label: string;
}

export interface RecentUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subscription?: {
    type: string;
    status: string;
  };
  createdAt: string;
}

export interface PopularTrack {
  id: string;
  title: string;
  category: string;
  playCount: number;
  imageUrl?: string;
}

class AnalyticsServiceClass extends BaseService {
  /**
   * Get dashboard metrics summary
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.get<{
      success: boolean;
      data: {
        totalUsers: number;
        activeUsers: number;
        totalTracks: number;
        totalPrograms: number;
        totalRevenue: number;
        activeSubscriptions: number;
      };
    }>(
      '/analytics/admin/dashboard'
    );

    const revenueResponse = await this.get<{
      success: boolean;
      data: {
        mrr: number;
        totalRevenue: number;
      };
    }>(
      '/analytics/admin/revenue?period=month'
    );

    return {
      ...response.data,
      monthlyRevenue: revenueResponse.data.mrr || 0,
      trends: {
        users: 0,
        revenue: 0,
        subscriptions: 0,
      },
    };
  }

  /**
   * Get user growth data for charts
   * @param period - 'week' | 'month' | 'year'
   */
  async getUserGrowth(period: 'week' | 'month' | 'year' = 'month'): Promise<UserGrowthData[]> {
    const response = await this.get<{
      success: boolean;
      data: UserGrowthData[];
    }>(
      `/analytics/admin/users?period=${period}`
    );
    return response.data;
  }

  /**
   * Get revenue data for charts
   * @param period - 'week' | 'month' | 'year'
   */
  async getRevenue(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueData[]> {
    try {
      const response = await this.get<{
        success: boolean;
        data: {
          revenueOverTime?: Array<{
            _id: { year: number; month?: number; week?: number };
            revenue: number;
            count: number;
          }>;
          mrr?: number;
          totalRevenue?: number;
        };
      }>(
        `/analytics/admin/revenue?period=${period}`
      );

      console.log('getRevenue - Full Response:', response);
      console.log('getRevenue - Response.data:', response.data);

      const revenueOverTime = response.data?.revenueOverTime || [];
      console.log('getRevenue - Revenue Over Time:', revenueOverTime);

      const result = revenueOverTime.map((item: any) => {
        let label = '';
        let date = '';

        const itemId = item.id || item._id;

        if (period === 'week') {
          label = `أسبوع ${itemId.week}`;
          date = `${itemId.year}-W${itemId.week}`;
        } else if (period === 'year') {
          label = `${itemId.year}`;
          date = `${itemId.year}`;
        } else {
          const monthNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
          label = `${monthNames[itemId.month || 1]}`;
          date = `${itemId.year}-${String(itemId.month || 1).padStart(2, '0')}`;
        }

        return {
          date,
          amount: item.revenue,
          label,
        };
      });

      console.log('getRevenue - Transformed Result:', result);
      return result;
    } catch (error) {
      console.error('getRevenue - Error:', error);
      throw error;
    }
  }

  /**
   * Get recent users
   * @param limit - Number of users to fetch (default: 5)
   */
  async getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
    const response = await this.get<ApiResponse<{ users: any[] }>>(
      `/admin/users?limit=${limit}&sort=-createdAt`
    );

    // The API returns { users: [...], pagination: {...} }
    const users = response.data.users || [];

    // Transform to match RecentUser interface
    return users.map((user: any) => ({
      id: user._id || user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      subscription: user.subscription ? {
        type: this.getSubscriptionType(user.subscription),
        status: user.subscription.status,
      } : undefined,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Helper to determine subscription type from subscription data
   */
  private getSubscriptionType(subscription: any): string {
    if (!subscription || subscription.status !== 'active') {
      return 'none';
    }
    // You can add logic here to determine premium/standard/basic based on packageId
    // For now, just return a generic type
    return 'standard';
  }

  /**
   * Get popular tracks
   * @param limit - Number of tracks to fetch (default: 5)
   */
  async getPopularTracks(limit: number = 5): Promise<PopularTrack[]> {
    const response = await this.get<ApiResponse<PopularTrack[]>>(
      `/admin/analytics/tracks/popular?limit=${limit}`
    );
    return response.data;
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
export default AnalyticsService;
