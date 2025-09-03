import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Star, Users, Globe } from 'lucide-react';
import { useShowDetailData } from '@/hooks/useTMDB';
import { Tabs } from '@/components/Tabs';
import { Carousel } from '@/components/Carousel';
import { ShowCard } from '@/components/ShowCard';
import { ShowDetailSkeleton } from '@/components/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StreamingProviders } from '@/components/StreamingProviders';
import { buildImageUrl } from '@/utils/imageUrl';
import { formatDate, formatRuntime, formatRating } from '@/utils/formatters';
import type { Cast, Season, TVShow } from '@/types/tmdb';

function ShowHero({ show }: { show: any }) {
  const backdropUrl = buildImageUrl({ path: show.backdrop_path, size: 'w1280' });
  const posterUrl = buildImageUrl({ path: show.poster_path, size: 'w500' });

  return (
    <div className="relative">
      {/* Backdrop Image */}
      <div 
        className="h-[70vh] bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(17, 24, 39, 1) 0%, rgba(17, 24, 39, 0.8) 40%, rgba(17, 24, 39, 0.4) 100%), url(${backdropUrl})`
        }}
      >
        {/* Content Container */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={show.name}
                  className="w-48 lg:w-64 rounded-xl shadow-2xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">{show.name}</h1>
                {show.tagline && (
                  <p className="text-xl text-gray-300 italic mb-6">{show.tagline}</p>
                )}
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{formatRating(show.vote_average)}</span>
                  </div>
                  
                  {show.first_air_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(show.first_air_date)}</span>
                    </div>
                  )}
                  
                  {show.episode_run_time?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{formatRuntime(show.episode_run_time[0])}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>{show.status}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {show.genres?.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-800/80 rounded-full text-sm font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Networks */}
                {show.networks?.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">Available on:</span>
                    <div className="flex gap-3">
                      {show.networks.slice(0, 4).map((network: any) => (
                        <div key={network.id} className="flex items-center gap-2">
                          {network.logo_path ? (
                            <img
                              src={buildImageUrl({ path: network.logo_path, size: 'w92' })}
                              alt={network.name}
                              className="h-6 w-auto"
                            />
                          ) : (
                            <span className="text-sm bg-gray-700 px-2 py-1 rounded">
                              {network.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ show }: { show: any }) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      {show.overview && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
          <p className="text-gray-300 leading-relaxed text-lg">{show.overview}</p>
        </div>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Show Details</h4>
          <dl className="space-y-2 text-gray-300">
            {show.original_name !== show.name && (
              <>
                <dt className="text-gray-400 inline">Original Title:</dt>
                <dd className="inline ml-2">{show.original_name}</dd>
              </>
            )}
            <div>
              <dt className="text-gray-400 inline">Episodes:</dt>
              <dd className="inline ml-2">{show.number_of_episodes}</dd>
            </div>
            <div>
              <dt className="text-gray-400 inline">Language:</dt>
              <dd className="inline ml-2">{show.original_language?.toUpperCase()}</dd>
            </div>
            {show.last_air_date && (
              <div>
                <dt className="text-gray-400 inline">Last Aired:</dt>
                <dd className="inline ml-2">{formatDate(show.last_air_date)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Production</h4>
          <div className="space-y-4">
            {show.production_companies?.length > 0 && (
              <div>
                <h5 className="text-gray-400 mb-2">Production Companies</h5>
                <div className="space-y-2">
                  {show.production_companies.slice(0, 3).map((company: any) => (
                    <div key={company.id} className="flex items-center gap-3">
                      {company.logo_path && (
                        <img
                          src={buildImageUrl({ path: company.logo_path, size: 'w92' })}
                          alt={company.name}
                          className="h-8 w-auto"
                        />
                      )}
                      <span className="text-gray-300">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CastTab({ credits }: { credits: any }) {
  if (!credits?.cast?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No cast information available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {credits.cast.slice(0, 18).map((person: Cast) => (
        <div key={person.id} className="text-center">
          <div className="aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-gray-800">
            {person.profile_path ? (
              <img
                src={buildImageUrl({ path: person.profile_path, size: 'w185' })}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
            {person.name}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2">{person.character}</p>
        </div>
      ))}
    </div>
  );
}

function SeasonsTab({ show }: { show: any }) {
  if (!show?.seasons?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No season information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {show.seasons
        .filter((season: Season) => season.season_number >= 0) // Filter out specials with negative numbers
        .map((season: Season) => (
          <div key={season.id} className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="aspect-[2/3] w-32 rounded-lg overflow-hidden bg-gray-700">
                  {season.poster_path ? (
                    <img
                      src={buildImageUrl({ path: season.poster_path, size: 'w342' })}
                      alt={season.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{season.name}</h3>
                
                <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-400">
                  <span>{season.episode_count} episodes</span>
                  {season.air_date && (
                    <span>Aired {formatDate(season.air_date)}</span>
                  )}
                  {season.vote_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>{formatRating(season.vote_average)}</span>
                    </div>
                  )}
                </div>
                
                {season.overview && (
                  <p className="text-gray-300 leading-relaxed">{season.overview}</p>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function SimilarTab({ similar }: { similar: any }) {
  if (!similar?.results?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No similar shows found</p>
      </div>
    );
  }

  return (
    <Carousel
      title=""
      items={similar.results.slice(0, 20)}
      renderItem={(show: TVShow) => (
        <ShowCard 
          key={show.id} 
          show={show} 
          onClick={(show) => window.location.href = `/show/${show.id}`}
        />
      )}
      className="px-0"
    />
  );
}

export function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const showId = id ? parseInt(id, 10) : null;
  
  const { details, credits, similar, watchProviders, isLoading, hasError, errors } = useShowDetailData(showId);

  // Loading state
  if (isLoading || !showId) {
    return <ShowDetailSkeleton />;
  }

  // Error state
  if (hasError || !details.data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Failed to load show details</h2>
          <p className="text-gray-400 mb-6">
            {errors.details || 'Something went wrong while fetching the show information.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tmdb-secondary text-white rounded-lg hover:bg-tmdb-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const show = details.data;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab show={show} />,
    },
    {
      id: 'cast',
      label: 'Cast',
      content: <CastTab credits={credits.data} />,
    },
    {
      id: 'where-to-watch',
      label: 'Where to Watch',
      content: (
        <div className="space-y-6">
          <StreamingProviders 
            watchProviders={watchProviders.data} 
            region="US"
          />
        </div>
      ),
    },
    {
      id: 'seasons',
      label: 'Seasons',
      content: <SeasonsTab show={show} />,
    },
    {
      id: 'similar',
      label: 'Similar Shows',
      content: <SimilarTab similar={similar.data} />,
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>

        {/* Hero Section */}
        <ShowHero show={show} />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Tabs 
            tabs={tabs}
            defaultTab="overview"
            className="bg-transparent"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}