/**
 * React Query hooks for Search functionality
 */

import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/lib/api/services/SearchService';
import { SearchFilters } from '@/types/filters';
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export const useSearch = (query: string, filters?: SearchFilters) => {
  const debouncedQuery = useDebounce(query, 500);

  const trimmedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

  return useQuery({
    queryKey: ['search', trimmedQuery, filters],
    queryFn: () => SearchService.search(trimmedQuery, filters),
    staleTime: 2 * 60 * 1000,
    enabled: trimmedQuery.length >= 2,
  });
};

export const useSearchSuggestions = (query: string) => {
  const debouncedQuery = useDebounce(query, 300);

  const trimmedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

  return useQuery({
    queryKey: ['search', 'suggestions', trimmedQuery],
    queryFn: () => SearchService.getSearchSuggestions(trimmedQuery),
    staleTime: 5 * 60 * 1000,
    enabled: trimmedQuery.length >= 2,
  });
};
