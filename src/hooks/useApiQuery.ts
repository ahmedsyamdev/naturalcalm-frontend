/**
 * Custom React Query Hook
 * Wraps useQuery with automatic error handling and toast notifications
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { handleApiError, isApiError } from '@/lib/api/errors';

export function useApiQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    onError: (error: TError) => {
      const apiError = handleApiError(error);

      if (isApiError(apiError)) {
        toast({
          title: 'خطأ',
          description: apiError.message,
          variant: 'destructive',
        });
      }

      if (options.onError) {
        options.onError(error);
      }
    },
  });
}
