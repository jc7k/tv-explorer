import React from 'react';
import { ExternalLink, Play, ShoppingCart } from 'lucide-react';
import { buildImageUrl } from '@/utils/imageUrl';
import type { WatchProviders, WatchProvider } from '@/types/tmdb';

interface StreamingProvidersProps {
  watchProviders?: WatchProviders | null;
  region?: string;
  className?: string;
}

interface ProviderSectionProps {
  title: string;
  providers: WatchProvider[];
  icon: React.ComponentType<any>;
  iconColor: string;
  link?: string;
}

function ProviderSection({ title, providers, icon: Icon, iconColor, link }: ProviderSectionProps) {
  if (!providers?.length) return null;

  const content = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h4 className="text-white font-semibold">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-3">
        {providers.slice(0, 6).map((provider) => (
          <div
            key={provider.provider_id}
            className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 hover:bg-gray-700/50 transition-colors"
            title={provider.provider_name}
          >
            {provider.logo_path ? (
              <img
                src={buildImageUrl({ 
                  path: provider.logo_path, 
                  size: 'w92',
                  fallback: '/placeholder-provider.png'
                })}
                alt={provider.provider_name}
                className="w-8 h-8 rounded object-contain bg-white p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span 
              className={`text-sm text-gray-300 font-medium ${!provider.logo_path ? '' : provider.logo_path ? 'hidden' : ''}`}
            >
              {provider.provider_name}
            </span>
          </div>
        ))}
        {providers.length > 6 && (
          <div className="flex items-center justify-center bg-gray-800/30 rounded-lg px-3 py-2 text-gray-400 text-sm">
            +{providers.length - 6} more
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gray-800/20 rounded-lg p-3 -m-3 transition-colors group"
      >
        <div className="flex items-start justify-between">
          {content}
          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </a>
    );
  }

  return <div className="p-3 -m-3">{content}</div>;
}

export function StreamingProviders({ 
  watchProviders, 
  region = 'US', 
  className = '' 
}: StreamingProvidersProps) {
  if (!watchProviders?.results) {
    return null;
  }

  const regionData = watchProviders.results[region];
  
  if (!regionData) {
    return (
      <div className={`bg-gray-800/30 rounded-xl p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-white mb-4">Where to Watch</h3>
        <p className="text-gray-400">
          Streaming information not available for your region ({region}).
        </p>
      </div>
    );
  }

  const { flatrate = [], rent = [], buy = [], link } = regionData;
  const hasAnyProviders = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

  if (!hasAnyProviders) {
    return (
      <div className={`bg-gray-800/30 rounded-xl p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-white mb-4">Where to Watch</h3>
        <p className="text-gray-400">
          No streaming providers available in your region ({region}).
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Where to Watch</h3>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tmdb-secondary hover:text-tmdb-secondary/80 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View on JustWatch
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="space-y-6">
        <ProviderSection
          title="Stream"
          providers={flatrate}
          icon={Play}
          iconColor="text-green-400"
          link={link}
        />

        <ProviderSection
          title="Rent"
          providers={rent}
          icon={ExternalLink}
          iconColor="text-blue-400"
        />

        <ProviderSection
          title="Buy"
          providers={buy}
          icon={ShoppingCart}
          iconColor="text-yellow-400"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Streaming data provided by JustWatch. Availability may vary by region.
        </p>
      </div>
    </div>
  );
}

export default StreamingProviders;