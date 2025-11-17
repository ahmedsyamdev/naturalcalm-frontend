/**
 * Admin Services
 * Export all admin-related API services
 */

export { AdminAuthService, default as AdminAuthServiceDefault } from './AuthService';
export { AnalyticsService, default as AnalyticsServiceDefault } from './AnalyticsService';
export { AdminContentService, default as AdminContentServiceDefault } from './ContentService';
export { AdminUserService, default as AdminUserServiceDefault } from './UserService';
export { AdminSubscriptionService, default as AdminSubscriptionServiceDefault } from './SubscriptionService';
export type {
  DashboardMetrics,
  UserGrowthData,
  RevenueData,
  RecentUser,
  PopularTrack,
} from './AnalyticsService';
export type {
  CreateCategoryData,
  UpdateCategoryData,
  CreateTrackData,
  UpdateTrackData,
  CreateProgramData,
  UpdateProgramData,
  FileUploadResponse,
  ContentStats,
} from './ContentService';
export type {
  AdminUser,
  ListeningSession,
  SubscriptionHistory,
  EnrolledProgram,
  FavoriteItem,
  UserFilters,
  UsersListResponse,
  UserDetailsResponse,
  UpdateUserData,
  GrantSubscriptionData,
  BanUserData,
} from './UserService';
export type {
  PackageFilters,
  UpdatePackageData,
  CreateCouponData,
  UpdateCouponData,
  CouponFilters,
  PaymentFilters,
  RefundPaymentData,
  RevenueFilters,
} from './SubscriptionService';
