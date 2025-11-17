/**
 * Upgrade Prompt Component
 * Modal prompting users to upgrade their subscription to access premium content
 */

import { useNavigate } from "react-router-dom";
import { Crown, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: "track" | "program";
  contentTitle?: string;
}

const benefits = [
  "الوصول لجميع المسارات المميزة",
  "برامج التأمل المتقدمة",
  "محتوى حصري ومحدث باستمرار",
  "تجربة خالية من الإعلانات",
  "دعم فني على مدار الساعة",
];

const UpgradePrompt = ({
  isOpen,
  onClose,
  contentType = "track",
  contentTitle,
}: UpgradePromptProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate("/subscription");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-right space-y-4 pt-6">
          {/* Premium Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <DialogTitle className="text-2xl text-center">محتوى مميز</DialogTitle>
          <DialogDescription className="text-center text-base">
            {contentTitle ? (
              <>
                {contentType === "track" ? "المسار" : "البرنامج"} <strong>"{contentTitle}"</strong> متاح
                للمشتركين فقط
              </>
            ) : (
              "هذا المحتوى متاح للمشتركين فقط"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-sm mb-3 text-right">ماذا تحصل عند الاشتراك:</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 justify-end text-sm">
                  <span>{benefit}</span>
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white rounded-full h-12 font-medium"
            >
              <Crown className="ml-2 w-4 h-4" />
              اشترك الآن
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full rounded-full h-12 font-medium">
              ربما لاحقاً
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;
