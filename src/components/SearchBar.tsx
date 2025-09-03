import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchBarProps, TVShow } from '@/types/tmdb';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchTVShows } from '@/hooks/useTMDB';
import { getPosterUrl } from '@/utils/imageUrl';
import { formatYear } from '@/utils/formatters';

export function SearchBar({ 
  onSearch, 
  placeholder = "Search TV shows...", 
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);
  
  // Search API call
  const { data: searchResults, loading: isSearching } = useSearchTVShows(debouncedQuery);
  
  // Get top 8 results for dropdown
  const suggestions = searchResults?.results?.slice(0, 8) || [];

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowResults(value.length > 0);
    
    onSearch?.(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectShow(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSubmit();
        }
        break;
        
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle show selection
  const handleSelectShow = (show: TVShow) => {
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    navigate(`/show/${show.id}`);
    inputRef.current?.blur();
  };

  // Handle form submission (Enter without selection)
  const handleSubmit = () => {
    if (!query.trim()) return;
    
    // Navigate to search results page
    setShowResults(false);
    setSelectedIndex(-1);
    
    // Navigate to search results page with query
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    
    onSearch?.('');
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(query.length > 0)}
          placeholder={placeholder}
          className="
            w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4
            bg-white/10 backdrop-blur-sm
            border border-white/20
            rounded-full
            text-sm sm:text-base text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-tmdb-secondary focus:border-transparent
            transition-all duration-200
          "
          autoComplete="off"
          aria-label="Search TV shows"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {/* Loading indicator or clear button */}
        <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
          {isSearching && debouncedQuery ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="
                text-gray-400 hover:text-white
                p-1 rounded-full
                transition-colors duration-200
              "
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Search results dropdown */}
      {showResults && (suggestions.length > 0 || isSearching) && (
        <div
          ref={resultsRef}
          className="
            absolute top-full left-0 right-0 mt-2
            bg-gray-800 backdrop-blur-sm
            border border-gray-700
            rounded-lg shadow-xl
            max-h-96 overflow-y-auto
            z-50
            animate-slide-up
          "
          role="listbox"
          aria-label="Search results"
        >
          {isSearching && debouncedQuery ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-gray-300 mx-auto mb-2" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((show, index) => (
                <button
                  key={show.id}
                  onClick={() => handleSelectShow(show)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    text-left hover:bg-gray-700
                    transition-colors duration-150
                    ${index === selectedIndex ? 'bg-gray-700' : ''}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  {/* Poster thumbnail */}
                  <div className="flex-shrink-0 w-12 h-16 bg-gray-700 rounded overflow-hidden">
                    {show.poster_path ? (
                      <img
                        src={getPosterUrl(show.poster_path, 'w92')}
                        alt={`${show.name} poster`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Show info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {show.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {show.first_air_date && formatYear(show.first_air_date)}
                      {show.origin_country && show.origin_country.length > 0 && (
                        <span className="ml-2">
                          {show.origin_country.join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Rating */}
                  {show.vote_average > 0 && (
                    <div className="flex-shrink-0 text-gray-400 text-sm">
                      ⭐ {show.vote_average.toFixed(1)}
                    </div>
                  )}
                </button>
              ))}
              
              {/* View all results link */}
              {searchResults && searchResults.total_results > 8 && (
                <div className="border-t border-gray-700 p-3">
                  <button
                    onClick={handleSubmit}
                    className="w-full text-center text-tmdb-secondary hover:text-white transition-colors duration-200"
                  >
                    View all {searchResults.total_results.toLocaleString()} results
                  </button>
                </div>
              )}
            </>
          ) : debouncedQuery && !isSearching ? (
            <div className="p-4 text-center text-gray-400">
              No shows found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}