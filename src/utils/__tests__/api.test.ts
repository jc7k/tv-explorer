import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTrendingTVShows,
  searchTVShows,
  getTVShowDetails,
  getPopularTVShows,
  TMDBError,
  discoverTVShows,
  getTVGenres
} from '../api'
import { mockTrendingResponse, mockShowDetails, mockSearchResponse } from '@/test/mocks'

// Mock the cache module
vi.mock('../cache', () => ({
  cachedFetch: vi.fn()
}))

// Mock environment
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_TMDB_API_KEY: 'test_api_key'
  }
})

describe('TMDB API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTrendingTVShows', () => {
    it('fetches trending shows for day timeWindow', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      const result = await getTrendingTVShows('day')

      expect(result).toEqual(mockTrendingResponse)
      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/tv/day',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_api_key'
          })
        }),
        { ttl: 30 * 60 * 1000 }
      )
    })

    it('fetches trending shows for week timeWindow', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getTrendingTVShows('week')

      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/tv/week',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('defaults to day timeWindow', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getTrendingTVShows()

      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/tv/day',
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('searchTVShows', () => {
    it('searches for TV shows with encoded query', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockSearchResponse)

      const result = await searchTVShows('Game of Thrones')

      expect(result).toEqual(mockSearchResponse)
      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/tv?query=Game%20of%20Thrones&page=1',
        expect.any(Object),
        { ttl: 5 * 60 * 1000 }
      )
    })

    it('handles special characters in search query', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockSearchResponse)

      await searchTVShows('Breaking Bad & Better Call Saul')

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.stringContaining('Breaking%20Bad%20%26%20Better%20Call%20Saul'),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('supports pagination', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockSearchResponse)

      await searchTVShows('test', 2)

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('getTVShowDetails', () => {
    it('fetches show details by ID', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockShowDetails)

      const result = await getTVShowDetails(1399)

      expect(result).toEqual(mockShowDetails)
      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/tv/1399',
        expect.any(Object),
        { ttl: 60 * 60 * 1000 }
      )
    })
  })

  describe('getPopularTVShows', () => {
    it('fetches popular shows with default page', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getPopularTVShows()

      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/tv/popular?page=1',
        expect.any(Object),
        { ttl: 15 * 60 * 1000 }
      )
    })

    it('supports custom page parameter', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getPopularTVShows(3)

      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/tv/popular?page=3',
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('discoverTVShows', () => {
    it('builds query string from parameters', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await discoverTVShows({
        page: 2,
        'vote_average.gte': 7.0,
        with_genres: '18,10765',
        sort_by: 'popularity.desc'
      })

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/discover/tv?'),
        expect.any(Object),
        { ttl: 10 * 60 * 1000 }
      )

      const url = vi.mocked(cachedFetch).mock.calls[0][0] as string
      expect(url).toContain('page=2')
      expect(url).toContain('vote_average.gte=7')
      expect(url).toContain('with_genres=18%2C10765')
      expect(url).toContain('sort_by=popularity.desc')
    })

    it('handles empty parameters', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await discoverTVShows({})

      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/discover/tv',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('filters out undefined/null/empty values', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await discoverTVShows({
        page: 1,
        with_genres: '',
        'vote_average.gte': undefined,
        sort_by: 'popularity.desc'
      })

      const url = vi.mocked(cachedFetch).mock.calls[0][0] as string
      expect(url).toContain('page=1')
      expect(url).toContain('sort_by=popularity.desc')
      expect(url).not.toContain('with_genres')
      expect(url).not.toContain('vote_average.gte')
    })
  })

  describe('getTVGenres', () => {
    it('fetches TV genres with long cache', async () => {
      const { cachedFetch } = await import('../cache')
      const genresResponse = { genres: [{ id: 18, name: 'Drama' }] }
      vi.mocked(cachedFetch).mockResolvedValue(genresResponse)

      const result = await getTVGenres()

      expect(result).toEqual(genresResponse)
      expect(cachedFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/genre/tv/list',
        expect.any(Object),
        { ttl: 24 * 60 * 60 * 1000 }
      )
    })
  })

  describe('Error Handling', () => {
    it('throws TMDBError when API key is missing', async () => {
      // Mock missing API key
      const originalEnv = import.meta.env.VITE_TMDB_API_KEY
      delete import.meta.env.VITE_TMDB_API_KEY

      await expect(getTrendingTVShows()).rejects.toThrow(TMDBError)
      await expect(getTrendingTVShows()).rejects.toThrow('TMDB API key is not configured')

      // Restore API key
      import.meta.env.VITE_TMDB_API_KEY = originalEnv
    })

    it('handles rate limiting with retry', async () => {
      const { cachedFetch } = await import('../cache')
      
      // Mock 429 error first, then success
      vi.mocked(cachedFetch)
        .mockRejectedValueOnce(new Error('HTTP 429: Too Many Requests'))
        .mockResolvedValueOnce(mockTrendingResponse)

      vi.useFakeTimers()

      const promise = getTrendingTVShows()

      // Fast-forward the retry delay
      await vi.advanceTimersByTimeAsync(1000)

      const result = await promise

      expect(result).toEqual(mockTrendingResponse)
      expect(cachedFetch).toHaveBeenCalledTimes(2)
      
      // Second call should skip cache
      expect(cachedFetch).toHaveBeenNthCalledWith(2,
        expect.any(String),
        expect.any(Object),
        { ttl: 30 * 60 * 1000, skip: true }
      )

      vi.useRealTimers()
    })

    it('handles HTTP errors', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockRejectedValue(new Error('HTTP 404: Not Found'))

      await expect(getTrendingTVShows()).rejects.toThrow(TMDBError)
      await expect(getTrendingTVShows()).rejects.toThrow('HTTP 404: Not Found')
    })

    it('handles network errors', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockRejectedValue(new Error('Network error'))

      await expect(getTrendingTVShows()).rejects.toThrow(TMDBError)
      await expect(getTrendingTVShows()).rejects.toThrow('Network error')
    })

    it('handles unknown errors', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockRejectedValue('Unknown error')

      await expect(getTrendingTVShows()).rejects.toThrow(TMDBError)
      await expect(getTrendingTVShows()).rejects.toThrow('Failed to fetch data from TMDB API')
    })
  })

  describe('Request Configuration', () => {
    it('includes correct headers', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getTrendingTVShows()

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.any(String),
        {
          headers: {
            'Authorization': 'Bearer test_api_key',
            'Content-Type': 'application/json'
          }
        },
        expect.any(Object)
      )
    })

    it('uses correct base URL', async () => {
      const { cachedFetch } = await import('../cache')
      vi.mocked(cachedFetch).mockResolvedValue(mockTrendingResponse)

      await getTrendingTVShows()

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.themoviedb.org/3'),
        expect.any(Object),
        expect.any(Object)
      )
    })
  })
})