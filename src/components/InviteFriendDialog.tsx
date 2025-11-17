/**
 * Invite Friend Dialog
 * Allows users to invite friends via referral code
 */

import { useState, useEffect, useRef } from "react";
import { Copy, Share2, Mail, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateInvite } from "@/hooks/queries/useProfile";
import { toast } from "sonner";

interface InviteFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteFriendDialog = ({ open, onOpenChange }: InviteFriendDialogProps) => {
  const generateInvite = useGenerateInvite();
  const [copied, setCopied] = useState(false);
  const [inviteData, setInviteData] = useState<{ referralCode: string; inviteUrl: string } | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        generateInvite.mutate(undefined, {
          onSuccess: (data) => {
            setInviteData(data);
          },
          onError: () => {
            toast.error("فشل إنشاء رمز الدعوة");
            hasFetchedRef.current = false;
          },
        });
      }
    } else {
      setCopied(false);
      hasFetchedRef.current = false;
      setInviteData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCopy = async () => {
    if (!inviteData) return;

    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      toast.success("تم نسخ رابط الدعوة");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ الرابط");
    }
  };

  const handleWhatsAppShare = () => {
    if (!inviteData) return;

    const message = encodeURIComponent(
      `مرحباً! أدعوك للانضمام إلى تطبيق Naturacalm للتأمل والاسترخاء.\n\nاستخدم الرابط التالي للتسجيل:\n${inviteData.inviteUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmailShare = () => {
    if (!inviteData) return;

    const subject = encodeURIComponent("دعوة للانضمام إلى Naturacalm");
    const body = encodeURIComponent(
      `مرحباً!\n\nأدعوك للانضمام إلى تطبيق Naturacalm للتأمل والاسترخاء.\n\nاستخدم الرابط التالي للتسجيل:\n${inviteData.inviteUrl}\n\nأو استخدم رمز الدعوة: ${inviteData.referralCode}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShare = async () => {
    if (!inviteData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "دعوة للانضمام إلى Naturacalm",
          text: `انضم إلي في تطبيق Naturacalm للتأمل والاسترخاء. استخدم رمز الدعوة: ${inviteData.referralCode}`,
          url: inviteData.inviteUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>دعوة صديق</DialogTitle>
          <DialogDescription>
            شارك رمز الدعوة مع أصدقائك للانضمام إلى Naturacalm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {generateInvite.isPending || !inviteData ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">جاري إنشاء رمز الدعوة...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">رمز الدعوة الخاص بك</p>
                  <div className="bg-primary/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-primary tracking-wider">
                      {inviteData.referralCode}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">أو شارك الرابط</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 ml-2" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 ml-2" />
                          نسخ الرابط
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-center">مشاركة عبر</p>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={handleWhatsAppShare}
                  >
                    <span className="text-2xl">💬</span>
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={handleEmailShare}
                  >
                    <Mail className="w-6 h-6" />
                    <span className="text-xs">البريد</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={handleShare}
                  >
                    <Share2 className="w-6 h-6" />
                    <span className="text-xs">المزيد</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
