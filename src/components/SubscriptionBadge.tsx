/**
 * Subscription Badge Component
 * Display user's subscription status and tier
 */

import { Crown, AlertCircle } from "lucide-react";
import { useCurrentSubscription } from "@/hooks/queries/useSubscription";
import { Badge } from "@/components/ui/badge";

interface SubscriptionBadgeProps {
  showExpiry?: boolean;
  variant?: "compact" | "full";
}

const SubscriptionBadge = ({ showExpiry = true, variant = "compact" }: SubscriptionBadgeProps) => {
  const { data: subscription, isLoading } = useCurrentSubscription();

  if (isLoading) {
    return null;
  }

  if (!subscription) {
    return (
      <Badge variant="secondary" className="text-xs">
        مجاني
      </Badge>
    );
  }

  const isExpiringSoon = subscription.daysRemaining <= 7;
  const isPremium = subscription.type === "premium";

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <Badge
          variant={isPremium ? "default" : "secondary"}
          className={`text-xs flex items-center gap-1 ${
            isPremium ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white" : ""
          }`}
        >
          <Crown className="w-3 h-3" />
          {isPremium ? "بريميوم" : "أساسي"}
        </Badge>
        {showExpiry && isExpiringSoon && (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {subscription.daysRemaining} يوم
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isPremium ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-gray-200"
            }`}
          >
            <Crown className={`w-4 h-4 ${isPremium ? "text-white" : "text-gray-600"}`} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {isPremium ? "اشتراك بريميوم" : "اشتراك أساسي"}
            </p>
            <p className="text-xs text-muted-foreground">
              {subscription.daysRemaining} يوم متبقي
            </p>
          </div>
        </div>
        {isExpiringSoon && (
          <Badge variant="destructive" className="text-xs">
            ينتهي قريباً
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBadge;
