import { useState, useEffect, useCallback } from 'react';
import type {
  TVShow,
  TVShowDetails,
  Credits,
  WatchProviders,
  TMDBResponse,
  TrendingResponse,
  SearchResponse,
  APIState,
} from '@/types/tmdb';
import * as api from '@/utils/api';

/**
 * Generic hook for API requests with loading and error states
 */
function useAPICall<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
): APIState<T> {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const executeCall = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    executeCall();
  }, [executeCall]);

  return state;
}

/**
 * Hook for fetching trending TV shows
 */
export function useTrendingTVShows(timeWindow: 'day' | 'week' = 'day'): APIState<TrendingResponse> {
  return useAPICall(
    () => api.getTrendingTVShows(timeWindow),
    [timeWindow]
  );
}

/**
 * Hook for fetching popular TV shows
 */
export function usePopularTVShows(page: number = 1): APIState<TMDBResponse<TVShow>> {
  return useAPICall(
    () => api.getPopularTVShows(page),
    [page]
  );
}

/**
 * Hook for searching TV shows
 */
export function useSearchTVShows(query: string, page: number = 1): APIState<SearchResponse> & {
  refetch: () => void;
} {
  const [state, setState] = useState<APIState<SearchResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(async (searchQuery: string, searchPage: number) => {
    if (!searchQuery.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await api.searchTVShows(searchQuery, searchPage);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      });
    }
  }, []);

  const refetch = useCallback(() => {
    search(query, page);
  }, [search, query, page]);

  useEffect(() => {
    search(query, page);
  }, [search, query, page]);

  return { ...state, refetch };
}

/**
 * Hook for fetching TV show details
 */
export function useTVShowDetails(id: number | null): APIState<TVShowDetails> & {
  refetch: () => void;
} {
  const [state, setState] = useState<APIState<TVShowDetails>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchDetails = useCallback(async (showId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await api.getTVShowDetails(showId);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch show details',
      });
    }
  }, []);

  const refetch = useCallback(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [fetchDetails, id]);

  useEffect(() => {
    if (id) {
      fetchDetails(id);
    } else {
      setState({ data: null, loading: false, error: null });
    }
  }, [fetchDetails, id]);

  return { ...state, refetch };
}

/**
 * Hook for fetching TV show credits
 */
export function useTVShowCredits(id: number | null): APIState<Credits> {
  return useAPICall(
    () => {
      if (!id) throw new Error('Show ID is required');
      return api.getTVShowCredits(id);
    },
    [id]
  );
}

/**
 * Hook for fetching similar TV shows
 */
export function useSimilarTVShows(id: number | null, page: number = 1): APIState<TMDBResponse<TVShow>> {
  return useAPICall(
    () => {
      if (!id) throw new Error('Show ID is required');
      return api.getSimilarTVShows(id, page);
    },
    [id, page]
  );
}

/**
 * Hook for fetching TV show recommendations
 */
export function useTVShowRecommendations(id: number | null, page: number = 1): APIState<TMDBResponse<TVShow>> {
  return useAPICall(
    () => {
      if (!id) throw new Error('Show ID is required');
      return api.getTVShowRecommendations(id, page);
    },
    [id, page]
  );
}

/**
 * Hook for fetching TV show watch providers
 */
export function useTVShowWatchProviders(id: number | null): APIState<WatchProviders> {
  return useAPICall(
    () => {
      if (!id) throw new Error('Show ID is required');
      return api.getTVShowWatchProviders(id);
    },
    [id]
  );
}

/**
 * Hook for fetching top rated TV shows
 */
export function useTopRatedTVShows(page: number = 1): APIState<TMDBResponse<TVShow>> {
  return useAPICall(
    () => api.getTopRatedTVShows(page),
    [page]
  );
}

/**
 * Combined hook for show detail page that fetches all related data
 */
export function useShowDetailData(id: number | null) {
  const details = useTVShowDetails(id);
  const credits = useTVShowCredits(id);
  const similar = useSimilarTVShows(id);
  const watchProviders = useTVShowWatchProviders(id);

  return {
    details,
    credits,
    similar,
    watchProviders,
    isLoading: details.loading || credits.loading || similar.loading || watchProviders.loading,
    hasError: !!(details.error || credits.error || similar.error || watchProviders.error),
    errors: {
      details: details.error,
      credits: credits.error,
      similar: similar.error,
      watchProviders: watchProviders.error,
    },
  };
}

/**
 * Hook for lazy loading more shows (infinite scroll)
 */
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<TMDBResponse<T>>,
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction(page);
      
      setData(prev => [...prev, ...response.results]);
      setHasMore(page < response.total_pages);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, hasMore, enabled, page]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (enabled && data.length === 0 && !loading && hasMore) {
      loadMore();
    }
  }, [enabled, data.length, loading, hasMore, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}