import type { ImageSize, BackdropSize, ImageUrlOptions } from '@/types/tmdb';

// Default TMDB image configuration
// This should be fetched from the API, but we'll use defaults for now
const DEFAULT_CONFIG = {
  secure_base_url: 'https://image.tmdb.org/t/p/',
  poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
};

/**
 * Build a complete TMDB image URL
 */
export function buildImageUrl(options: ImageUrlOptions): string {
  const { path, size, fallback } = options;

  if (!path) {
    return fallback || '/placeholder-poster.jpg';
  }

  return `${DEFAULT_CONFIG.secure_base_url}${size}${path}`;
}

/**
 * Get poster URL with fallback
 */
export function getPosterUrl(
  path: string | null, 
  size: ImageSize = 'w342', 
  fallback?: string
): string {
  return buildImageUrl({ path, size, fallback });
}

/**
 * Get backdrop URL with fallback
 */
export function getBackdropUrl(
  path: string | null, 
  size: BackdropSize = 'w1280', 
  fallback?: string
): string {
  return buildImageUrl({ path, size, fallback });
}

/**
 * Get profile image URL with fallback
 */
export function getProfileUrl(
  path: string | null, 
  size: ImageSize = 'w185', 
  fallback?: string
): string {
  return buildImageUrl({ path, size, fallback });
}

/**
 * Generate srcset for responsive images
 */
export function generatePosterSrcSet(path: string | null): string {
  if (!path) return '';

  const sizes: ImageSize[] = ['w185', 'w342', 'w500', 'w780'];
  return sizes
    .map(size => `${getPosterUrl(path, size)} ${size.substring(1)}w`)
    .join(', ');
}

/**
 * Generate srcset for backdrop images
 */
export function generateBackdropSrcSet(path: string | null): string {
  if (!path) return '';

  const sizes: BackdropSize[] = ['w780', 'w1280'];
  return sizes
    .map(size => `${getBackdropUrl(path, size)} ${size.substring(1)}w`)
    .join(', ');
}

/**
 * Get the optimal image size based on viewport width
 */
export function getOptimalPosterSize(viewportWidth: number): ImageSize {
  if (viewportWidth < 400) return 'w185';
  if (viewportWidth < 600) return 'w342';
  if (viewportWidth < 1000) return 'w500';
  return 'w780';
}

/**
 * Get the optimal backdrop size based on viewport width
 */
export function getOptimalBackdropSize(viewportWidth: number): BackdropSize {
  if (viewportWidth < 800) return 'w780';
  return 'w1280';
}