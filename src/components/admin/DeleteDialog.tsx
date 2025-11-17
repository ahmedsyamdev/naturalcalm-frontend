/**
 * Delete Confirmation Dialog
 * Generic delete confirmation dialog component
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  warningMessage?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  warningMessage,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/95 backdrop-blur-md" dir="rtl">
        <AlertDialogHeader className="text-right">
          <AlertDialogTitle className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {description}
          </AlertDialogDescription>
          {warningMessage && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'Tajawal' }}>
                ⚠️ {warningMessage}
              </p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
            style={{ fontFamily: 'Tajawal' }}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            حذف
          </AlertDialogAction>
          <AlertDialogCancel
            disabled={isDeleting}
            className="bg-white/60 border-white/80"
            style={{ fontFamily: 'Tajawal' }}
          >
            إلغاء
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialog;
