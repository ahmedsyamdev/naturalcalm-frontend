/**
 * Custom React Query Mutation Hook
 * Wraps useMutation with automatic error handling and toast notifications
 */

import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { handleApiError, isApiError } from '@/lib/api/errors';

interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { successMessage, errorMessage, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    onSuccess: (data: TData, variables: TVariables, context: TContext) => {
      if (successMessage) {
        toast({
          title: 'نجحت العملية',
          description: successMessage,
        });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error: TError, variables: TVariables, context: TContext | undefined) => {
      const apiError = handleApiError(error);

      if (isApiError(apiError)) {
        toast({
          title: 'خطأ',
          description: errorMessage || apiError.message,
          variant: 'destructive',
        });
      }

      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  });
}
