/**
 * Search Service
 * Handles API calls for search functionality with filtering and suggestions
 */

import { BaseService } from '../BaseService';
import { SearchFilters, SearchResults } from '@/types/filters';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class SearchServiceClass extends BaseService {
  async search(query: string, filters?: SearchFilters): Promise<SearchResults> {
    const params = {
      q: query,
      ...filters,
    };

    const response = await this.get<ApiResponse<SearchResults>>('/search', {
      params,
    });
    return response.data;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await this.get<ApiResponse<string[]>>('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  }
}

export const SearchService = new SearchServiceClass();
