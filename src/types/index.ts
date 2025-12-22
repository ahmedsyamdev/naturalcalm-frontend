/**
 * Data types for the Naturacalm meditation app
 */

export type DifficultyLevel = "مبتدأ" | "متوسط" | "متقدم";

export type CategoryType = "التأمل" | "المسارات" | "التنويم الايحائي" | "الطبيعة" | "الاسترخاء";

export type RelaxationType = "استرخاء صباحي" | "استرخاء مسائي";

export type ContentAccess = "free" | "basic" | "premium";

export interface Track {
  id: string;
  title: string;
  description?: string;
  duration: string; // e.g., "20:00 د"
  plays: string; // e.g., "12 الف"
  level: DifficultyLevel;
  category: CategoryType;
  relaxationType?: RelaxationType;
  imageUrl: string;
  audioUrl?: string;
  streamUrl?: string; // Signed URL for streaming
  isFavorite: boolean;
  isPremium?: boolean; // Deprecated: Use contentAccess instead
  contentAccess?: ContentAccess;
}

export interface Program {
  id: string;
  title: string;
  description?: string;
  level: DifficultyLevel;
  category: CategoryType;
  sessions: number; // Total number of sessions
  completedSessions: number; // Number of completed sessions
  totalPlays: string; // e.g., "12 الف"
  thumbnailUrl: string;
  thumbnailImages: string[]; // Multiple images for the program preview
  tracks: Track[];
  isFavorite: boolean;
  isPremium?: boolean; // Deprecated: Use contentAccess instead
  contentAccess?: ContentAccess;
  isFeatured?: boolean;
  progress?: number; // Percentage completed
}

export interface Category {
  id: string;
  name: CategoryType;
  icon: string;
  color: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  subscription?: Subscription;
  favoriteTrackIds: string[];
  favoriteProgramIds: string[];
  customPrograms: CustomProgram[];
}

export interface Subscription {
  id?: string;
  _id?: string;
  userId?: string;
  packageId: string | Package; // Can be ID string or populated Package object
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
  paymentMethod?: string;
  cancellationDate?: string;
  daysRemaining: number; // Virtual field from backend
  isActive?: boolean; // Virtual field from backend
  // Legacy fields for backward compatibility
  type?: "basic" | "standard" | "premium";
  price?: string | number;
  totalDays?: number;
}

export interface CustomProgram {
  id: string;
  name: string;
  description?: string;
  trackIds?: string[]; // For creation
  tracks?: Track[]; // For fetched custom program with populated tracks
  thumbnailUrl?: string;
  createdAt: string;
  // Program-compatible fields (use name as title)
  title?: string;
  level?: DifficultyLevel;
  category?: CategoryType;
}

export interface Package {
  id: string;
  _id: string;
  name: string;
  nameEn?: string;
  type?: "basic" | "standard" | "premium";
  price: string | number;
  period: "شهر" | "سنة" | "3 أشهر";
  periodArabic?: string;
  discount?: string;
  discountPercentage?: number;
  features: string[];
  isActive?: boolean;
  durationDays?: number;
  durationInDays?: number;
  currency?: string;
  displayOrder?: number;
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "apple-pay";
  label: string;
  icon: string;
}

export interface ProgressStats {
  totalMinutes: number;
  totalTracks: number;
  totalPrograms: number;
  weeklyData: {
    week: string;
    minutes: number;
  }[];
}

// Audio Streaming & Sessions Types
export interface StreamResponse {
  url: string;
  expiresIn: number; // Expiration time in seconds
  expiresAt?: string; // ISO timestamp when URL expires
}

export interface ListeningSession {
  id: string;
  trackId: string;
  programId?: string;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  currentTime: number; // Current playback time in seconds
  duration: number; // Track duration in seconds
  completed: boolean;
}

export interface SessionUpdate {
  currentTime: number;
  duration: number;
}

export interface SessionStartRequest {
  trackId: string;
  programId?: string;
}

export interface SessionEndRequest {
  completed: boolean;
}

// Profile & Stats Types
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserPreferences {
  notifications?: boolean;
  emailNotifications?: boolean;
  language?: string;
  theme?: string;
}

export interface WeeklyData {
  week: string;
  minutes: number;
  day?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

export interface InviteResponse {
  referralCode: string;
  inviteUrl: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicablePackages: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponStats {
  totalUses: number;
  totalDiscountGiven: number;
  successRate: number;
  users: {
    id: string;
    name: string;
    usedAt: string;
    discountAmount: number;
  }[];
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'visa' | 'apple-pay';

export interface Payment {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  package: {
    id: string;
    name: string;
    type: string;
  };
  amount: number;
  originalAmount: number;
  discountAmount?: number;
  coupon?: {
    id: string;
    code: string;
  };
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  transactionId: string;
  stripePaymentIntentId?: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  totalActiveSubscriptions: number;
  basicSubscriptions: number;
  standardSubscriptions: number;
  premiumSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  subscriptions: number;
}

// Notification Types
export * from './notifications';

