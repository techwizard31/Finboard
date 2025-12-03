interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
  }

  private getCacheKey(key: string): string {
    return `finboard_cache_${key}`;
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('finboard_cache_')) {
          const value = localStorage.getItem(key);
          if (value) {
            const cacheItem = JSON.parse(value);
            const actualKey = key.replace('finboard_cache_', '');
            this.cache.set(actualKey, cacheItem);
          }
        }
      });
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, cacheItem);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.getCacheKey(key),
          JSON.stringify(cacheItem)
        );
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);

    if (!cacheItem) {
      return null;
    }

    // Check if expired
    if (Date.now() > cacheItem.expiresAt) {
      this.delete(key);
      return null;
    }

    return cacheItem.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.getCacheKey(key));
    }
  }

  clear(): void {
    this.cache.clear();

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('finboard_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  has(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;

    // Check if expired
    if (Date.now() > cacheItem.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  getAge(key: string): number | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;

    return Date.now() - cacheItem.timestamp;
  }
}

export const cacheManager = new CacheManager();