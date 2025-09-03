import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { CarouselProps } from '@/types/tmdb';
import { useRenderPerformance } from '@/hooks/usePerformanceMonitor';

export function Carousel<T>({ items, title, renderItem, className = '' }: CarouselProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  useRenderPerformance('Carousel');

  // Memoize items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);

  // Throttled scroll position check for better performance
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const newCanScrollLeft = scrollLeft > 0;
    const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    
    // Only update state if values actually changed
    setCanScrollLeft(prev => prev !== newCanScrollLeft ? newCanScrollLeft : prev);
    setCanScrollRight(prev => prev !== newCanScrollRight ? newCanScrollRight : prev);
  }, []);

  // Optimized scroll functions with requestAnimationFrame
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const cardWidth = container.children[0]?.clientWidth || 0;
      const scrollAmount = cardWidth * 3;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const cardWidth = container.children[0]?.clientWidth || 0;
      const scrollAmount = cardWidth * 3;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }, []);

  // Throttled event handlers for better performance
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let resizeTimeout: NodeJS.Timeout;

    const throttledScrollCheck = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkScrollPosition, 16); // ~60fps
    };

    const throttledResizeCheck = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScrollPosition, 100);
    };

    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', throttledScrollCheck, { passive: true });
    window.addEventListener('resize', throttledResizeCheck, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
      container.removeEventListener('scroll', throttledScrollCheck);
      window.removeEventListener('resize', throttledResizeCheck);
    };
  }, [checkScrollPosition, memoizedItems]);

  if (!items || items.length === 0) {
    return (
      <section className={`mb-8 ${className}`}>
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <div className="text-gray-400">No items to display</div>
      </section>
    );
  }

  return (
    <section className={`relative mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        
        {/* Navigation arrows - only show on larger screens */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`
              p-2 rounded-full transition-all duration-200
              ${canScrollLeft 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }
            `}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`
              p-2 rounded-full transition-all duration-200
              ${canScrollRight 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }
            `}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel container */}
      <div 
        ref={scrollContainerRef}
        className="
          flex overflow-x-auto overflow-y-hidden
          scroll-smooth snap-x snap-mandatory
          gap-4 pb-4
          scrollbar-hide
          -mx-4 px-4
          md:mx-0 md:px-0
        "
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {memoizedItems.map((item, index) => (
          <div 
            key={index} 
            className="
              snap-start snap-always
              flex-shrink-0
              animate-fade-in
            "
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Scroll indicators for mobile */}
      <div className="md:hidden flex justify-center mt-4 gap-1">
        <div className={`h-1 rounded-full transition-all duration-300 ${
          canScrollLeft ? 'bg-white/30' : 'bg-white/60'
        } w-8`} />
        <div className={`h-1 rounded-full transition-all duration-300 ${
          canScrollRight ? 'bg-white/30' : 'bg-white/60'  
        } w-8`} />
      </div>

      {/* Gradient overlays for visual scroll indication */}
      {canScrollLeft && (
        <div className="
          absolute left-0 top-0 bottom-4
          w-8 bg-gradient-to-r from-gray-900 to-transparent
          pointer-events-none z-10
          hidden md:block
        " />
      )}
      {canScrollRight && (
        <div className="
          absolute right-0 top-0 bottom-4
          w-8 bg-gradient-to-l from-gray-900 to-transparent
          pointer-events-none z-10
          hidden md:block
        " />
      )}
    </section>
  );
}