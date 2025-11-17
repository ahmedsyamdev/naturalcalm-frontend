/**
 * Content Access Control Utilities
 * Handles logic for determining if a user can access specific content
 */

import { ContentAccess } from '@/types';

export type UserSubscriptionType = 'free' | 'basic' | 'premium';

/**
 * Check if user has access to content based on their subscription
 */
export function canAccessContent(
  contentAccess: ContentAccess = 'free',
  userSubscription: UserSubscriptionType = 'free'
): boolean {
  // Free content is accessible to everyone
  if (contentAccess === 'free') return true;

  // Basic content requires at least basic subscription
  if (contentAccess === 'basic') {
    return userSubscription === 'basic' || userSubscription === 'premium';
  }

  // Premium content requires premium subscription
  if (contentAccess === 'premium') {
    return userSubscription === 'premium';
  }

  return false;
}

/**
 * Get the access level label in Arabic
 */
export function getAccessLevelLabel(contentAccess: ContentAccess = 'free'): string {
  const labels: Record<ContentAccess, string> = {
    free: 'مجاني',
    basic: 'أساسي',
    premium: 'مميز',
  };

  return labels[contentAccess] || labels.free;
}

/**
 * Get the access level color for badges
 */
export function getAccessLevelColor(contentAccess: ContentAccess = 'free'): string {
  const colors: Record<ContentAccess, string> = {
    free: 'bg-green-100 text-green-800',
    basic: 'bg-blue-100 text-blue-800',
    premium: 'bg-yellow-100 text-yellow-800',
  };

  return colors[contentAccess] || colors.free;
}

/**
 * Get the required subscription message for locked content
 */
export function getRequiredSubscriptionMessage(contentAccess: ContentAccess): string {
  const messages: Record<ContentAccess, string> = {
    free: '',
    basic: 'يتطلب اشتراك أساسي',
    premium: 'يتطلب اشتراك مميز',
  };

  return messages[contentAccess] || '';
}

/**
 * Determine user subscription type from user object
 */
export function getUserSubscriptionType(user: any): UserSubscriptionType {
  if (!user || !user.subscription) return 'free';

  const subscriptionType = user.subscription.type;

  // Check if subscription is still valid
  if (user.subscription.endDate) {
    const endDate = new Date(user.subscription.endDate);
    const now = new Date();

    if (endDate < now) {
      return 'free'; // Subscription expired
    }
  }

  return subscriptionType === 'premium' ? 'premium' : subscriptionType === 'basic' ? 'basic' : 'free';
}
