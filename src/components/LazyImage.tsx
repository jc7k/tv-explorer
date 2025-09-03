import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  srcSet,
  sizes,
  alt,
  className = '',
  fallback,
  placeholder,
  onLoad,
  onError,
  loading = 'lazy',
  threshold = 0.1,
  rootMargin = '50px',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError && fallback) {
    return <div ref={containerRef}>{fallback}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && placeholder && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
        />
      )}

      {/* Error fallback */}
      {hasError && !fallback && (
        <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-800 flex flex-col items-center justify-center text-gray-400">
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
          <span className="text-xs text-center px-2">Image unavailable</span>
        </div>
      )}
    </div>
  );
}