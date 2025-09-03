// TMDB API Response Types

export interface TMDBConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
    logo_sizes: string[];
    profile_sizes: string[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
  adult: boolean;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  networks: Network[];
  production_companies: ProductionCompany[];
  status: string;
  tagline: string;
  type: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  };
  next_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  } | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  order: number;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface Crew {
  id: number;
  name: string;
  department: string;
  job: string;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Crew[];
  guest_stars: Cast[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link?: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}

// API Response Wrappers
export interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TrendingResponse extends TMDBResponse<TVShow> {
  dates?: {
    maximum: string;
    minimum: string;
  };
}

export interface SearchResponse extends TMDBResponse<TVShow> {}

// Hook State Types
export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface CarouselProps<T> {
  items: T[];
  title: string;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

export interface ShowCardProps {
  show: TVShow;
  onClick?: (show: TVShow) => void;
  className?: string;
}

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
}

// Utility Types
export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

export interface ImageUrlOptions {
  path: string | null;
  size: ImageSize | BackdropSize;
  fallback?: string;
}