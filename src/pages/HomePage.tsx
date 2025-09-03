
import { SearchBar } from '@/components/SearchBar';
import { Carousel } from '@/components/Carousel';
import { ShowCard } from '@/components/ShowCard';
import { CarouselSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorBoundary';
import { useTrendingTVShows, usePopularTVShows } from '@/hooks/useTMDB';

export function HomePage() {
  // Fetch trending and popular shows
  const { 
    data: trendingData, 
    loading: trendingLoading, 
    error: trendingError 
  } = useTrendingTVShows('day');
  
  const { 
    data: popularData, 
    loading: popularLoading, 
    error: popularError 
  } = usePopularTVShows();

  const handleSearch = (query: string) => {
    // Search is handled within SearchBar component
    // This could trigger additional actions if needed
    console.log('Search query:', query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-tmdb-primary">
      {/* Hero Section */}
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(33,208,122,0.1),transparent_50%)]" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Discover
              <span className="text-tmdb-secondary"> TV Shows</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
              Explore trending series, find your next binge-watch, and dive deep into 
              the world of television with detailed cast, episodes, and streaming info.
            </p>
            
            {/* Search Bar */}
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for TV shows..."
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12 sm:pb-16">
        {/* Trending Today Carousel */}
        <div className="mb-12">
          {trendingLoading ? (
            <CarouselSkeleton title="🔥 Trending Today" />
          ) : trendingError ? (
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">🔥 Trending Today</h2>
              <ErrorMessage
                title="Unable to load trending shows"
                message={trendingError}
                onRetry={() => window.location.reload()}
                className="bg-gray-800/50 rounded-lg"
              />
            </div>
          ) : trendingData?.results ? (
            <Carousel
              title="🔥 Trending Today"
              items={trendingData.results}
              renderItem={(show) => <ShowCard show={show} />}
            />
          ) : null}
        </div>

        {/* Popular TV Shows Carousel */}
        <div className="mb-12">
          {popularLoading ? (
            <CarouselSkeleton title="⭐ Most Popular" />
          ) : popularError ? (
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">⭐ Most Popular</h2>
              <ErrorMessage
                title="Unable to load popular shows"
                message={popularError}
                onRetry={() => window.location.reload()}
                className="bg-gray-800/50 rounded-lg"
              />
            </div>
          ) : popularData?.results ? (
            <Carousel
              title="⭐ Most Popular"
              items={popularData.results}
              renderItem={(show) => <ShowCard show={show} />}
            />
          ) : null}
        </div>

        {/* Features Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-tmdb-secondary/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-tmdb-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Trending Content</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Discover what's hot right now with daily updated trending shows and popularity rankings.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-tmdb-secondary/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-tmdb-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Smart Search</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Find any TV show instantly with intelligent search suggestions and real-time results.
            </p>
          </div>

          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-tmdb-secondary/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-tmdb-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Detailed Info</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Get comprehensive details including cast, seasons, episodes, and where to watch.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Data provided by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-tmdb-secondary hover:text-white transition-colors duration-200"
            >
              The Movie Database (TMDB)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}