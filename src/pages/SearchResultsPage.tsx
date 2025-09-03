import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { SearchFilters, type SearchFilters as SearchFiltersType } from '@/components/SearchFilters';
import { ShowCard } from '@/components/ShowCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSearchTVShows, useDiscoverTVShows } from '@/hooks/useTMDB';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import type { DiscoverTVParams } from '@/utils/api';
import type { TVShow } from '@/types/tmdb';

const ITEMS_PER_PAGE = 20;
const DEFAULT_FILTERS: SearchFiltersType = {
  genres: [],
  yearRange: { min: null, max: null },
  ratingRange: { min: null, max: null },
  networks: [],
  sortBy: 'popularity.desc',
};

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFiltersType>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Saved searches functionality
  const [savedSearches, setSavedSearches] = useLocalStorage<Array<{
    id: string;
    query: string;
    filters: SearchFiltersType;
    timestamp: number;
  }>>('saved-searches', []);

  // Debounce query for performance
  const debouncedQuery = useDebounce(query, 500);

  // Convert filters to TMDB API params
  const discoverParams: DiscoverTVParams = useMemo(() => {
    const params: DiscoverTVParams = {
      page: currentPage,
      sort_by: filters.sortBy,
    };

    if (filters.genres.length > 0) {
      params.with_genres = filters.genres.join(',');
    }

    if (filters.networks.length > 0) {
      params.with_networks = filters.networks.join(',');
    }

    if (filters.yearRange.min) {
      params['first_air_date.gte'] = `${filters.yearRange.min}-01-01`;
    }

    if (filters.yearRange.max) {
      params['first_air_date.lte'] = `${filters.yearRange.max}-12-31`;
    }

    if (filters.ratingRange.min) {
      params['vote_average.gte'] = filters.ratingRange.min;
    }

    if (filters.ratingRange.max) {
      params['vote_average.lte'] = filters.ratingRange.max;
    }

    return params;
  }, [filters, currentPage]);

  // Use search or discover based on whether there's a query
  const searchResults = useSearchTVShows(debouncedQuery, currentPage);
  const discoverResults = useDiscoverTVShows(discoverParams);

  // Determine which results to use
  const isSearchMode = debouncedQuery.trim().length > 0;
  const results = isSearchMode ? searchResults : discoverResults;
  const shows = results.data?.results || [];
  const totalPages = results.data?.total_pages || 1;
  const totalResults = results.data?.total_results || 0;

  // Update URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    const newSearch = params.toString();
    if (newSearch !== searchParams.toString()) {
      setSearchParams(newSearch, { replace: true });
    }
  }, [query, currentPage, searchParams, setSearchParams]);

  // Reset page when query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters]);

  // Load saved search from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlPage = searchParams.get('page');
    
    if (urlQuery !== query) {
      setQuery(urlQuery || '');
    }
    
    if (urlPage && parseInt(urlPage) !== currentPage) {
      setCurrentPage(parseInt(urlPage));
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleShowClick = (show: TVShow) => {
    navigate(`/show/${show.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCurrentSearch = () => {
    if (!query.trim()) return;
    
    const searchId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSavedSearch = {
      id: searchId,
      query: query.trim(),
      filters: { ...filters },
      timestamp: Date.now(),
    };
    
    const updatedSavedSearches = [newSavedSearch, ...savedSearches.slice(0, 9)]; // Keep max 10
    setSavedSearches(updatedSavedSearches);
  };

  const loadSavedSearch = (savedSearch: typeof savedSearches[0]) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setCurrentPage(1);
  };

  const deleteSavedSearch = (searchId: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== searchId));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          px-3 py-2 mx-1 rounded-md
          bg-gray-700 text-white
          disabled:bg-gray-800 disabled:text-gray-600
          hover:bg-gray-600 disabled:hover:bg-gray-800
          transition-colors
        "
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-3 py-2 mx-1 rounded-md transition-colors
            ${i === currentPage
              ? 'bg-tmdb-secondary text-white'
              : 'bg-gray-700 text-white hover:bg-gray-600'
            }
          `}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          px-3 py-2 mx-1 rounded-md
          bg-gray-700 text-white
          disabled:bg-gray-800 disabled:text-gray-600
          hover:bg-gray-600 disabled:hover:bg-gray-800
          transition-colors
        "
      >
        Next
      </button>
    );

    return (
      <div className="flex justify-center items-center mt-8">
        <div className="flex items-center">
          {pages}
        </div>
        <div className="ml-4 text-gray-400 text-sm">
          Page {currentPage} of {totalPages} ({totalResults.toLocaleString()} results)
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">
              {isSearchMode ? `Search Results for "${debouncedQuery}"` : 'Discover TV Shows'}
            </h1>
            
            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for TV shows..."
              className="mb-6"
            />

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
                  {query.trim() && (
                    <button
                      onClick={saveCurrentSearch}
                      className="text-tmdb-secondary hover:text-white text-sm transition-colors"
                    >
                      Save Current Search
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.slice(0, 5).map((savedSearch) => (
                    <div key={savedSearch.id} className="flex items-center">
                      <button
                        onClick={() => loadSavedSearch(savedSearch)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-l-full transition-colors"
                      >
                        {savedSearch.query}
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(savedSearch.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-r-full transition-colors"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            className="mb-8"
          />

          {/* Results */}
          <div className="mb-8">
            {results.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : results.error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-lg mb-4">
                  {results.error}
                </div>
                <button
                  onClick={() => results.refetch?.()}
                  className="px-4 py-2 bg-tmdb-secondary hover:bg-tmdb-secondary/80 text-white rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : shows.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  {isSearchMode ? 'No shows found for your search.' : 'No shows match your filters.'}
                </div>
                <div className="text-gray-500 text-sm">
                  Try adjusting your {isSearchMode ? 'search terms' : 'filters'} or browse our trending shows.
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {shows.map((show) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      onClick={handleShowClick}
                      className="hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}