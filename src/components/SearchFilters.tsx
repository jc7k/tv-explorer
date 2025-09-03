import { useState } from 'react';
import type { Genre, Network } from '@/types/tmdb';
import { useTVGenres, useTVNetworks } from '@/hooks/useTMDB';

export interface SearchFilters {
  genres: number[];
  yearRange: {
    min: number | null;
    max: number | null;
  };
  ratingRange: {
    min: number | null;
    max: number | null;
  };
  networks: number[];
  sortBy: string;
}

export interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'first_air_date.asc', label: 'Oldest First' },
  { value: 'name.asc', label: 'Title A-Z' },
  { value: 'name.desc', label: 'Title Z-A' },
];

export function SearchFilters({ filters, onFiltersChange, className = '' }: SearchFiltersProps) {
  const { data: genresData, loading: genresLoading } = useTVGenres();
  const { data: networksData, loading: networksLoading } = useTVNetworks();
  
  const genres = genresData?.genres || [];
  const networks = networksData?.results?.slice(0, 20) || []; // Top 20 networks
  
  const [isExpanded, setIsExpanded] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    onFiltersChange({
      ...filters,
      genres: newGenres,
    });
  };

  const handleNetworkToggle = (networkId: number) => {
    const newNetworks = filters.networks.includes(networkId)
      ? filters.networks.filter(id => id !== networkId)
      : [...filters.networks, networkId];
    
    onFiltersChange({
      ...filters,
      networks: newNetworks,
    });
  };

  const handleYearChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : null;
    onFiltersChange({
      ...filters,
      yearRange: {
        ...filters.yearRange,
        [type]: numValue,
      },
    });
  };

  const handleRatingChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : null;
    onFiltersChange({
      ...filters,
      ratingRange: {
        ...filters.ratingRange,
        [type]: numValue,
      },
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      genres: [],
      yearRange: { min: null, max: null },
      ratingRange: { min: null, max: null },
      networks: [],
      sortBy: 'popularity.desc',
    });
  };

  const hasActiveFilters = 
    filters.genres.length > 0 || 
    filters.networks.length > 0 ||
    filters.yearRange.min !== null ||
    filters.yearRange.max !== null ||
    filters.ratingRange.min !== null ||
    filters.ratingRange.max !== null ||
    filters.sortBy !== 'popularity.desc';

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-white font-medium hover:text-tmdb-secondary transition-colors"
            aria-expanded={isExpanded}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Filters
            {hasActiveFilters && (
              <span className="bg-tmdb-secondary text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block text-white font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="
                w-full px-3 py-2
                bg-gray-700 border border-gray-600
                rounded-md text-white
                focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
              "
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-white font-medium mb-2">Release Year</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">From</label>
                <select
                  value={filters.yearRange.min || ''}
                  onChange={(e) => handleYearChange('min', e.target.value)}
                  className="
                    w-full px-3 py-2
                    bg-gray-700 border border-gray-600
                    rounded-md text-white
                    focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
                  "
                >
                  <option value="">Any</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">To</label>
                <select
                  value={filters.yearRange.max || ''}
                  onChange={(e) => handleYearChange('max', e.target.value)}
                  className="
                    w-full px-3 py-2
                    bg-gray-700 border border-gray-600
                    rounded-md text-white
                    focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
                  "
                >
                  <option value="">Any</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-white font-medium mb-2">Rating</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Minimum</label>
                <select
                  value={filters.ratingRange.min || ''}
                  onChange={(e) => handleRatingChange('min', e.target.value)}
                  className="
                    w-full px-3 py-2
                    bg-gray-700 border border-gray-600
                    rounded-md text-white
                    focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
                  "
                >
                  <option value="">Any</option>
                  {Array.from({ length: 10 }, (_, i) => (i + 1)).map(rating => (
                    <option key={rating} value={rating}>{rating}+ Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Maximum</label>
                <select
                  value={filters.ratingRange.max || ''}
                  onChange={(e) => handleRatingChange('max', e.target.value)}
                  className="
                    w-full px-3 py-2
                    bg-gray-700 border border-gray-600
                    rounded-md text-white
                    focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
                  "
                >
                  <option value="">Any</option>
                  {Array.from({ length: 10 }, (_, i) => (i + 1)).map(rating => (
                    <option key={rating} value={rating}>{rating} Stars</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-white font-medium mb-2">Genres</label>
            {genresLoading ? (
              <div className="text-gray-400">Loading genres...</div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors
                      ${filters.genres.includes(genre.id)
                        ? 'bg-tmdb-secondary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Networks */}
          <div>
            <label className="block text-white font-medium mb-2">Networks</label>
            {networksLoading ? (
              <div className="text-gray-400">Loading networks...</div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleNetworkToggle(network.id)}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors
                      ${filters.networks.includes(network.id)
                        ? 'bg-tmdb-secondary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {network.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}