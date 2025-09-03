import type {
  TMDBConfiguration,
  TVShow,
  TVShowDetails,
  Credits,
  WatchProviders,
  TMDBResponse,
  TrendingResponse,
  SearchResponse,
} from '@/types/tmdb';
import { cachedFetch } from './cache';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_TOKEN = import.meta.env.VITE_TMDB_API_KEY;

class TMDBError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TMDBError';
  }
}

async function fetchTMDB<T>(endpoint: string, cacheOptions?: { ttl?: number; skip?: boolean }): Promise<T> {
  if (!API_TOKEN) {
    throw new TMDBError('TMDB API key is not configured. Please check your environment variables.');
  }

  const url = `${BASE_URL}${endpoint}`;
  const options = {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    return await cachedFetch<T>(url, options, cacheOptions);
  } catch (error) {
    // Handle rate limiting with retry
    if (error instanceof Error && error.message.includes('429')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchTMDB(endpoint, { ...cacheOptions, skip: true }); // Skip cache on retry
    }

    if (error instanceof Error && error.message.includes('HTTP')) {
      throw new TMDBError(error.message);
    }
    
    // Network or parsing errors
    throw new TMDBError(
      error instanceof Error ? error.message : 'Failed to fetch data from TMDB API'
    );
  }
}

// Configuration - cache for 1 hour (rarely changes)
export async function getConfiguration(): Promise<TMDBConfiguration> {
  return fetchTMDB<TMDBConfiguration>('/configuration', { ttl: 60 * 60 * 1000 });
}

// Trending TV Shows - cache for 30 minutes (updates frequently)
export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'day'): Promise<TrendingResponse> {
  return fetchTMDB<TrendingResponse>(`/trending/tv/${timeWindow}`, { ttl: 30 * 60 * 1000 });
}

// Popular TV Shows - cache for 15 minutes
export async function getPopularTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/popular?page=${page}`, { ttl: 15 * 60 * 1000 });
}

// Search TV Shows - cache for 5 minutes (user-specific queries)
export async function searchTVShows(query: string, page: number = 1): Promise<SearchResponse> {
  const encodedQuery = encodeURIComponent(query);
  return fetchTMDB<SearchResponse>(`/search/tv?query=${encodedQuery}&page=${page}`, { ttl: 5 * 60 * 1000 });
}

// TV Show Details - cache for 1 hour (content rarely changes)
export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
  return fetchTMDB<TVShowDetails>(`/tv/${id}`, { ttl: 60 * 60 * 1000 });
}

// TV Show Credits
export async function getTVShowCredits(id: number): Promise<Credits> {
  return fetchTMDB<Credits>(`/tv/${id}/credits`);
}

// TV Show Recommendations
export async function getTVShowRecommendations(id: number, page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/recommendations?page=${page}`);
}

// TV Show Similar
export async function getSimilarTVShows(id: number, page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/similar?page=${page}`);
}

// TV Show Watch Providers
export async function getTVShowWatchProviders(id: number): Promise<WatchProviders> {
  return fetchTMDB<WatchProviders>(`/tv/${id}/watch/providers`);
}

// Top Rated TV Shows
export async function getTopRatedTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/top_rated?page=${page}`);
}

// On The Air TV Shows
export async function getOnTheAirTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/on_the_air?page=${page}`);
}

// Airing Today TV Shows
export async function getAiringTodayTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/airing_today?page=${page}`);
}

// Export the error class for external use
export { TMDBError };