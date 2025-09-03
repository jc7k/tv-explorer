

// Show card skeleton for carousels
export function ShowCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`w-48 min-w-[12rem] ${className}`}>
      {/* Poster skeleton */}
      <div className="
        w-full h-72 
        bg-gray-800 
        rounded-lg 
        animate-pulse
        relative
        overflow-hidden
      ">
        {/* Shimmer effect */}
        <div className="
          absolute inset-0 
          bg-gradient-to-r from-transparent via-white/5 to-transparent
          animate-shimmer
        " />
      </div>
      
      {/* Title skeleton */}
      <div className="mt-3 px-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded animate-pulse" />
        <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

// Carousel skeleton
export function CarouselSkeleton({ 
  title = 'Loading...', 
  itemCount = 6,
  className = '' 
}: { 
  title?: string; 
  itemCount?: number;
  className?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        
        {/* Navigation skeleton */}
        <div className="hidden md:flex gap-2">
          <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
          <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: itemCount }, (_, index) => (
          <ShowCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

// Show detail skeleton
export function ShowDetailSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      {/* Hero section skeleton */}
      <div className="relative h-96 bg-gray-800 animate-pulse">
        {/* Backdrop skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800" />
        
        {/* Content skeleton */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 space-y-4 max-w-4xl">
          <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-gray-700 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex space-x-1 mb-8">
          {['Overview', 'Cast', 'Seasons', 'Similar'].map((tab) => (
            <div 
              key={tab}
              className="px-4 py-2 bg-gray-800 rounded-lg animate-pulse h-10 w-20"
            />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generic content skeleton
export function ContentSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`
            h-4 bg-gray-800 rounded animate-pulse
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
}

// Grid skeleton for search results
export function GridSkeleton({ 
  itemCount = 12,
  className = '' 
}: { 
  itemCount?: number;
  className?: string;
}) {
  return (
    <div className={`
      grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
      gap-4
      ${className}
    `}>
      {Array.from({ length: itemCount }, (_, index) => (
        <ShowCardSkeleton key={index} className="w-full" />
      ))}
    </div>
  );
}

// Tab content skeleton
export function TabContentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <ContentSkeleton lines={4} />
      
      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="w-12 h-16 bg-gray-700 rounded animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}