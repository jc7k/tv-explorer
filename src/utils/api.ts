import type {
  TMDBConfiguration,
  TVShow,
  TVShowDetails,
  Credits,
  WatchProviders,
  TMDBResponse,
  TrendingResponse,
  SearchResponse,
  Genre,
  Network,
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

// Discover TV Shows with advanced filtering
export interface DiscoverTVParams {
  page?: number;
  sort_by?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  with_genres?: string;
  without_genres?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  with_networks?: string;
  with_origin_country?: string;
  with_original_language?: string;
  timezone?: string;
  'vote_count.gte'?: number;
  with_status?: string;
  with_type?: string;
}

export async function discoverTVShows(params: DiscoverTVParams = {}): Promise<TMDBResponse<TVShow>> {
  const queryParams = new URLSearchParams();
  
  // Add each parameter to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  const endpoint = `/discover/tv${queryString ? `?${queryString}` : ''}`;
  
  return fetchTMDB<TMDBResponse<TVShow>>(endpoint, { ttl: 10 * 60 * 1000 }); // 10 minutes cache
}

// Get all TV genres
export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  return fetchTMDB<{ genres: Genre[] }>('/genre/tv/list', { ttl: 24 * 60 * 60 * 1000 }); // 24 hours cache
}

// Get TV networks (popular ones)
export async function getTVNetworks(): Promise<TMDBResponse<Network>> {
  return fetchTMDB<TMDBResponse<Network>>('/network/popular', { ttl: 24 * 60 * 60 * 1000 }); // 24 hours cache
}

// Export the error class for external use
export { TMDBError };