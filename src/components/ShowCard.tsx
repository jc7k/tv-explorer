import { Link } from 'react-router-dom';
import type { ShowCardProps } from '@/types/tmdb';
import { getPosterUrl, generatePosterSrcSet } from '@/utils/imageUrl';
import { formatYear, formatRating, getRatingColor } from '@/utils/formatters';
import { LazyImage } from './LazyImage';
import { useRenderPerformance } from '@/hooks/usePerformanceMonitor';

export function ShowCard({ show, onClick, className = '' }: ShowCardProps) {
  useRenderPerformance('ShowCard');

  const handleImageLoad = () => {
    // Performance monitoring handled by LazyImage component
  };

  const handleClick = () => {
    if (onClick) {
      onClick(show);
    }
  };

  const CardContent = (
    <div 
      className={`
        group relative cursor-pointer
        w-48 min-w-[12rem] 
        transition-all duration-300
        hover:scale-105 hover:z-10
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Poster Container */}
      <div className="relative overflow-hidden rounded-lg shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
        {/* Lazy-loaded poster image */}
        <LazyImage
          src={getPosterUrl(show.poster_path, 'w342')}
          srcSet={generatePosterSrcSet(show.poster_path)}
          sizes="(max-width: 640px) 185px, 342px"
          alt={`${show.name} poster`}
          className="w-full h-72 object-cover transition-all duration-300 group-hover:scale-110"
          onLoad={handleImageLoad}
          loading="lazy"
          threshold={0.1}
          rootMargin="100px"
          placeholder={
            <div className="w-full h-72 bg-gray-800 animate-pulse flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          }
          fallback={
            <div className="w-full h-72 bg-gradient-to-b from-gray-700 to-gray-800 flex flex-col items-center justify-center text-gray-400">
              <svg 
                className="w-16 h-16 mb-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-xs text-center px-2">No Image Available</span>
            </div>
          }
        />

        {/* Rating badge */}
        {show.vote_average > 0 && (
          <div className="
            absolute top-2 right-2
            bg-black/70 backdrop-blur-sm
            rounded-full px-2 py-1
            text-xs font-semibold
            flex items-center gap-1
            transition-opacity duration-300
            group-hover:opacity-100
            opacity-90
          ">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className={getRatingColor(show.vote_average)}>
              {formatRating(show.vote_average)}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="
          absolute inset-0
          bg-gradient-to-t from-black/80 via-transparent to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          flex items-end p-4
        ">
          <div className="text-white">
            <p className="text-sm opacity-75 mb-1">
              {show.first_air_date && formatYear(show.first_air_date)}
              {show.origin_country && show.origin_country.length > 0 && (
                <span className="ml-2">
                  {show.origin_country.join(', ')}
                </span>
              )}
            </p>
            {show.overview && (
              <p className="text-xs opacity-90 line-clamp-3">
                {show.overview.length > 100 
                  ? `${show.overview.substring(0, 100)}...`
                  : show.overview
                }
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title and metadata */}
      <div className="mt-3 px-1">
        <h3 className="
          text-white font-semibold text-sm leading-tight
          line-clamp-2 mb-1
          group-hover:text-tmdb-secondary transition-colors duration-200
        ">
          {show.name}
        </h3>
        
        {show.first_air_date && (
          <p className="text-gray-400 text-xs">
            {formatYear(show.first_air_date)}
          </p>
        )}
      </div>

      {/* Accessibility helper */}
      <span className="sr-only">
        View details for {show.name}
        {show.first_air_date && `, released in ${formatYear(show.first_air_date)}`}
        {show.vote_average > 0 && `, rated ${formatRating(show.vote_average)}`}
      </span>
    </div>
  );

  // Wrap with Link if no custom onClick handler
  return onClick ? (
    CardContent
  ) : (
    <Link to={`/show/${show.id}`} className="block">
      {CardContent}
    </Link>
  );
}