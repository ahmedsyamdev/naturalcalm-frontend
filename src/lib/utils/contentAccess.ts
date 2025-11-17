/**
 * Content Access Utilities
 * Functions to check and manage content access based on subscription
 */

import { Track, Program, Subscription } from "@/types";

/**
 * Check if user has access to premium content
 */
export const hasActiveSubscription = (subscription: Subscription | null | undefined): boolean => {
  if (!subscription) {
    return false;
  }

  // Check if subscription is expired
  const endDate = new Date(subscription.endDate);
  const now = new Date();

  return endDate > now && subscription.daysRemaining > 0;
};

/**
 * Check if user has access to a specific track
 */
export const hasAccessToTrack = (
  track: Track,
  subscription: Subscription | null | undefined
): boolean => {
  // If track is not premium, everyone has access
  if (!track.isPremium) {
    return true;
  }

  // Premium content requires active subscription
  return hasActiveSubscription(subscription);
};

/**
 * Check if user has access to a specific program
 */
export const hasAccessToProgram = (
  program: Program,
  subscription: Subscription | null | undefined
): boolean => {
  // If program is not premium, everyone has access
  if (!program.isPremium) {
    return true;
  }

  // Premium content requires active subscription
  return hasActiveSubscription(subscription);
};

/**
 * Check if user needs to upgrade to access content
 */
export const needsUpgrade = (
  content: Track | Program,
  subscription: Subscription | null | undefined
): boolean => {
  return content.isPremium === true && !hasActiveSubscription(subscription);
};

/**
 * Get subscription tier label
 */
export const getSubscriptionTierLabel = (subscription: Subscription | null | undefined): string => {
  if (!subscription || !hasActiveSubscription(subscription)) {
    return "مجاني";
  }

  return subscription.type === "premium" ? "بريميوم" : "أساسي";
};

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export const isSubscriptionExpiringSoon = (
  subscription: Subscription | null | undefined
): boolean => {
  if (!subscription || !hasActiveSubscription(subscription)) {
    return false;
  }

  return subscription.daysRemaining <= 7;
};
