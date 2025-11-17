/**
 * Error Message Component
 * Displays error messages with optional retry functionality
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-red-900">حدث خطأ</h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-200 hover:bg-red-50"
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
