interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class APICache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  private generateKey(url: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}${paramStr}`;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  get<T>(url: string, params?: Record<string, any>): T | null {
    this.evictExpired();
    
    const key = this.generateKey(url, params);
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end for LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  set<T>(url: string, data: T, params?: Record<string, any>, ttl?: number): void {
    this.evictExpired();
    this.evictLRU();
    
    const key = this.generateKey(url, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  has(url: string, params?: Record<string, any>): boolean {
    const key = this.generateKey(url, params);
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.evictExpired();
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    this.evictExpired();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking for accurate rate
    };
  }
}

// Create singleton instance
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
});

// Cache-aware fetch function
export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit,
  cacheOptions?: { ttl?: number; skip?: boolean }
): Promise<T> {
  // Skip cache if requested
  if (cacheOptions?.skip) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Try cache first
  const cached = apiCache.get<T>(url, options);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  apiCache.set(url, data, options, cacheOptions?.ttl);
  
  return data;
}

// Invalidate cache entries by pattern
export function invalidateCache(pattern: string | RegExp): void {
  const keysToDelete: string[] = [];
  
  for (const key of apiCache['cache'].keys()) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    } else {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
  }
  
  keysToDelete.forEach(key => apiCache['cache'].delete(key));
}

export default apiCache;