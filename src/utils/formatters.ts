/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format a date to just the year
 */
export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch {
    return '';
  }
}

/**
 * Format vote average to stars or rating
 */
export function formatRating(rating: number): string {
  if (rating === 0) return 'NR';
  return `${rating.toFixed(1)}/10`;
}

/**
 * Format rating as percentage
 */
export function formatRatingPercent(rating: number): number {
  return Math.round(rating * 10);
}

/**
 * Get rating color class based on score
 */
export function getRatingColor(rating: number): string {
  if (rating >= 7) return 'text-green-500';
  if (rating >= 5) return 'text-yellow-500';
  if (rating > 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Format runtime in minutes to hours and minutes
 */
export function formatRuntime(minutes: number | number[]): string {
  const runtime = Array.isArray(minutes) ? minutes[0] || 0 : minutes;
  
  if (runtime === 0) return 'Unknown';

  const hours = Math.floor(runtime / 60);
  const mins = runtime % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format large numbers with suffixes (K, M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Format genre names into a readable string
 */
export function formatGenres(genres: Array<{ name: string }>): string {
  if (!genres || genres.length === 0) return '';
  return genres.map(genre => genre.name).join(', ');
}

/**
 * Format network names into a readable string
 */
export function formatNetworks(networks: Array<{ name: string }>): string {
  if (!networks || networks.length === 0) return '';
  return networks.map(network => network.name).join(', ');
}

/**
 * Format status text for better display
 */
export function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'returning series':
      return 'Continuing';
    case 'ended':
      return 'Ended';
    case 'canceled':
      return 'Cancelled';
    case 'in production':
      return 'In Production';
    case 'planned':
      return 'Planned';
    default:
      return status;
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'returning series':
      return 'text-green-500 bg-green-50 border-green-200';
    case 'ended':
      return 'text-gray-500 bg-gray-50 border-gray-200';
    case 'canceled':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'in production':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'planned':
      return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

/**
 * Create a readable list from an array
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')}, and ${lastItem}`;
}