/**
 * React Query hooks for Categories
 */

import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/lib/api/services/ContentService';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => ContentService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => ContentService.getCategoryById(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
};
