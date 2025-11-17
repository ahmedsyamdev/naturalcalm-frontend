/**
 * Admin Subscription Service
 * Handles API calls for managing subscriptions, packages, coupons, and payments
 */

import { BaseService } from '../../BaseService';
import type {
  Package,
  Coupon,
  CouponStats,
  Payment,
  PaymentStatus,
  SubscriptionStats,
  RevenueChartData,
} from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PackageFilters {
  isActive?: boolean;
}

export interface UpdatePackageData {
  name?: string;
  price?: number;
  discount?: number;
  features?: string[];
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateCouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
  applicablePackages: string[];
}

export interface UpdateCouponData {
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  applicablePackages?: string[];
  isActive?: boolean;
}

export interface CouponFilters {
  isActive?: boolean;
  isExpired?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  paymentMethod?: 'visa' | 'apple-pay';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RefundPaymentData {
  reason: string;
}

export interface RevenueFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

class AdminSubscriptionServiceClass extends BaseService {
  // ============ Package Management ============

  async getPackages(filters?: PackageFilters): Promise<Package[]> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }

    const url = `/admin/packages${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.get<ApiResponse<Package[]>>(url);
    return response.data;
  }

  async getPackage(id: string): Promise<Package> {
    const response = await this.get<ApiResponse<Package>>(`/admin/packages/${id}`);
    return response.data;
  }

  async updatePackage(id: string, data: UpdatePackageData): Promise<Package> {
    const response = await this.put<ApiResponse<Package>>(`/admin/packages/${id}`, data);
    return response.data;
  }

  // ============ Coupon Management ============

  async getCoupons(filters?: CouponFilters): Promise<PaginatedResponse<Coupon>> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters?.isExpired !== undefined) {
      params.append('isExpired', String(filters.isExpired));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }

    const url = `/admin/coupons${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get<PaginatedResponse<Coupon>>(url);
  }

  async getCoupon(id: string): Promise<Coupon> {
    const response = await this.get<ApiResponse<Coupon>>(`/admin/coupons/${id}`);
    return response.data;
  }

  async createCoupon(data: CreateCouponData): Promise<Coupon> {
    const response = await this.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return response.data;
  }

  async updateCoupon(id: string, data: UpdateCouponData): Promise<Coupon> {
    const response = await this.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return response.data;
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
  }

  async getCouponStats(id: string): Promise<CouponStats> {
    const response = await this.get<ApiResponse<CouponStats>>(`/admin/coupons/${id}/stats`);
    return response.data;
  }

  // ============ Payment Management ============

  async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }

    const url = `/admin/payments${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get<PaginatedResponse<Payment>>(url);
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await this.get<ApiResponse<Payment>>(`/admin/payments/${id}`);
    return response.data;
  }

  async refundPayment(id: string, data: RefundPaymentData): Promise<Payment> {
    const response = await this.post<ApiResponse<Payment>>(`/admin/payments/${id}/refund`, data);
    return response.data;
  }

  async exportPayments(filters?: PaymentFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const url = `/admin/payments/export${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get<Blob>(url, { responseType: 'blob' });
  }

  // ============ Analytics ============

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await this.get<ApiResponse<SubscriptionStats>>('/admin/subscriptions/stats');
    return response.data;
  }

  async getRevenueData(filters?: RevenueFilters): Promise<RevenueChartData[]> {
    try {
      const groupBy = filters?.groupBy || 'day';

      let period: 'week' | 'month' | 'year' = 'month';
      if (groupBy === 'week') {
        period = 'week';
      } else if (groupBy === 'month') {
        period = 'month';
      }

      const url = `/analytics/admin/revenue?period=${period}`;
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
      }>(url);

      console.log('getRevenueData - Full Response:', response);
      console.log('getRevenueData - Response.data:', response.data);

      const revenueOverTime = response.data?.revenueOverTime || [];
      console.log('getRevenueData - Revenue Over Time:', revenueOverTime);

      const result = revenueOverTime.map((item: any) => {
        let date = '';

        const itemId = item.id || item._id;

        if (period === 'week') {
          date = `${itemId.year}-W${String(itemId.week || 1).padStart(2, '0')}`;
        } else if (period === 'year') {
          date = `${itemId.year}`;
        } else {
          date = `${itemId.year}-${String(itemId.month || 1).padStart(2, '0')}-01`;
        }

        return {
          date,
          revenue: item.revenue,
          subscriptions: item.count,
        };
      });

      console.log('getRevenueData - Transformed Result:', result);
      return result;
    } catch (error) {
      console.error('getRevenueData - Error:', error);
      throw error;
    }
  }
}

export const AdminSubscriptionService = new AdminSubscriptionServiceClass();
export default AdminSubscriptionService;
