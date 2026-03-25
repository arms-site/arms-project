import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_ANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;

// Performance: Connection pooling and persistent Redis connection
let redisInstance: Redis | null = null;
const getRedis = () => {
  if (!useRedis) return null;
  if (!redisInstance) {
    redisInstance = new Redis({
      url: REDIS_URL!,
      token: REDIS_TOKEN!,
      retry: {
        retries: 2,
        backoff: (attempt) => Math.min(attempt * 50, 500)
      }
      // lazyConnect: true, // REMOVE this line
    });
  }
  return redisInstance;
};

// Cache configuration with multiple TTL strategies
const CACHE_CONFIG = {
  PRIMARY_KEY: 'home_data_v2',
  BACKUP_KEY: 'home_data_backup_v2',
  LOCK_KEY: 'home_fetch_lock_v2',
  PRIMARY_TTL: 1800, // 30 minutes for fresh data
  BACKUP_TTL: 86400, // 24 hours for backup data
  LOCK_TTL: 30, // 30 seconds for fetch lock
  STALE_WHILE_REVALIDATE: 3600, // 1 hour stale-while-revalidate
} as const;

// Performance: In-memory cache for ultra-fast responses
let memoryCache: {
  data: any;
  timestamp: number;
  ttl: number;
} | null = null;

const MEMORY_CACHE_TTL = 300000; // 5 minutes in milliseconds

// Performance: Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Performance: Optimized fetch with timeout and compression
async function fetchWithTimeout(url: string, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'ARMS-Anime-Client/1.0',
        'Cache-Control': 'no-cache',
      },
      // Performance: Disable keep-alive for external API to prevent connection pooling issues
      keepalive: false,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Performance: Optimized data validation
function isValidHomeData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Quick validation of expected structure
  const hasRequiredFields = (
    data.spotlightAnimes ||
    data.trendingAnimes ||
    data.latestEpisodeAnimes ||
    data.top10Animes
  );
  
  return !!hasRequiredFields;
}

// Performance: Stale-while-revalidate pattern
async function handleStaleWhileRevalidate(redis: Redis, cachedData: any, cacheAge: number) {
  if (cacheAge > CACHE_CONFIG.STALE_WHILE_REVALIDATE) {
    // Trigger background refresh without blocking response
    setTimeout(async () => {
      try {
        await refreshCacheInBackground(redis);
      } catch (error) {
        console.error('[HOME API] Background refresh failed:', error);
      }
    }, 0);
  }
  return cachedData;
}

// Performance: Background cache refresh
async function refreshCacheInBackground(redis: Redis) {
  const lockKey = CACHE_CONFIG.LOCK_KEY;
  
  try {
    // Try to acquire lock for background refresh
    const acquired = await redis.set(lockKey, 'refreshing', {
      ex: CACHE_CONFIG.LOCK_TTL,
      nx: true // Only set if not exists
    });
    
    if (!acquired) return; // Another process is already refreshing
    
    const response = await fetchWithTimeout(`${API_URL}/api/v2/hianime/home`, 5000);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (isValidHomeData(data.data)) {
      // Update both primary and backup cache
      await Promise.all([
        redis.set(CACHE_CONFIG.PRIMARY_KEY, data.data, { ex: CACHE_CONFIG.PRIMARY_TTL }),
        redis.set(CACHE_CONFIG.BACKUP_KEY, data.data, { ex: CACHE_CONFIG.BACKUP_TTL }),
      ]);
      
      // Update memory cache
      memoryCache = {
        data: data.data,
        timestamp: Date.now(),
        ttl: MEMORY_CACHE_TTL
      };
    }
  } catch (error) {
    console.error('[HOME API] Background refresh error:', error);
  } finally {
    // Always release the lock
    await redis.del(lockKey).catch(() => {});
  }
}

// Performance: Multi-layer cache strategy
async function getCachedData(redis: Redis | null) {
  // Layer 1: Memory cache (fastest)
  if (memoryCache && Date.now() - memoryCache.timestamp < memoryCache.ttl) {
    return { data: memoryCache.data, source: 'MEMORY', age: Date.now() - memoryCache.timestamp };
  }
  
  if (!redis) return null;
  
  // Layer 2: Redis primary cache
  const cached = await redis.get(CACHE_CONFIG.PRIMARY_KEY);
  if (cached) {
    // Update memory cache
    memoryCache = {
      data: cached,
      timestamp: Date.now(),
      ttl: MEMORY_CACHE_TTL
    };
    return { data: cached, source: 'REDIS_PRIMARY', age: 0 };
  }
  
  // Layer 3: Redis backup cache (for resilience)
  const backup = await redis.get(CACHE_CONFIG.BACKUP_KEY);
  if (backup) {
    return { data: backup, source: 'REDIS_BACKUP', age: CACHE_CONFIG.STALE_WHILE_REVALIDATE + 1 };
  }
  
  return null;
}

// Performance: Optimized API fetch with circuit breaker pattern
let failureCount = 0;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

async function fetchFromAPI(): Promise<any> {
  // Circuit breaker: if too many recent failures, return error quickly
  if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      throw new Error('Circuit breaker: API temporarily unavailable');
    } else {
      // Reset circuit breaker
      failureCount = 0;
    }
  }
  
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/v2/hianime/home`, 10000);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!isValidHomeData(data.data)) {
      throw new Error('Invalid API response structure');
    }
    
    // Reset failure count on success
    failureCount = 0;
    
    return data.data;
    
  } catch (error) {
    failureCount++;
    lastFailureTime = Date.now();
    throw error;
  }
}

export const GET: RequestHandler = async ({ url, request }) => {
  const startTime = Date.now();
  const redis = getRedis();
  
  // Performance: Check for force refresh parameter
  const forceRefresh = url.searchParams.has('refresh');
  
  try {
    // Performance: Request deduplication
    const requestKey = 'home_request';
    if (pendingRequests.has(requestKey) && !forceRefresh) {
      const result = await pendingRequests.get(requestKey)!;
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': 'DEDUPED',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      });
    }
    
    // If Redis is not configured, direct API call with memory cache
    if (!redis) {
      console.warn('[HOME API] Redis not configured, using memory cache only.');
      
      // Check memory cache first
      if (memoryCache && Date.now() - memoryCache.timestamp < memoryCache.ttl && !forceRefresh) {
        return new Response(JSON.stringify({ success: true, data: memoryCache.data }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': 'MEMORY',
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        });
      }
      
      // Create pending request
      const apiPromise = fetchFromAPI();
      pendingRequests.set(requestKey, apiPromise);
      
      try {
        const data = await apiPromise;
        
        // Update memory cache
        memoryCache = {
          data,
          timestamp: Date.now(),
          ttl: MEMORY_CACHE_TTL
        };
        
        return new Response(JSON.stringify({ success: true, data }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': 'NONE',
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        });
      } finally {
        pendingRequests.delete(requestKey);
      }
    }
    
    // Multi-layer cache check
    if (!forceRefresh) {
      const cachedResult = await getCachedData(redis);
      if (cachedResult) {
        // Handle stale-while-revalidate
        const refreshedData = await handleStaleWhileRevalidate(redis, cachedResult.data, cachedResult.age);
        
        return new Response(JSON.stringify({ success: true, data: refreshedData }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': cachedResult.source,
            'X-Cache-Age': `${cachedResult.age}ms`,
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        });
      }
    }
    
    // Cache miss or force refresh: fetch from API with locking
    const lockKey = CACHE_CONFIG.LOCK_KEY;
    
    // Try to acquire lock
    const acquired = await redis.set(lockKey, 'fetching', {
      ex: CACHE_CONFIG.LOCK_TTL,
      nx: true
    });
    
    if (!acquired && !forceRefresh) {
      // Another request is fetching, wait briefly and check cache again
      await new Promise(resolve => setTimeout(resolve, 100));
      const cachedResult = await getCachedData(redis);
      if (cachedResult) {
        return new Response(JSON.stringify({ success: true, data: cachedResult.data }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': 'WAIT_AND_HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        });
      }
    }
    
    // Create pending request to prevent duplicate API calls
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, fetchFromAPI());
    }
    
    try {
      const data = await pendingRequests.get(requestKey)!;
      
      // Save to all cache layers
      await Promise.all([
        redis.set(CACHE_CONFIG.PRIMARY_KEY, data, { ex: CACHE_CONFIG.PRIMARY_TTL }),
        redis.set(CACHE_CONFIG.BACKUP_KEY, data, { ex: CACHE_CONFIG.BACKUP_TTL }),
      ]);
      
      // Update memory cache
      memoryCache = {
        data,
        timestamp: Date.now(),
        ttl: MEMORY_CACHE_TTL
      };
      
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': forceRefresh ? 'REFRESH' : 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      });
      
    } finally {
      // Always clean up
      pendingRequests.delete(requestKey);
      await redis.del(lockKey).catch(() => {});
    }
    
  } catch (error) {
    console.error('[HOME API] Error:', error);
    
    // Fallback: try to serve stale data from backup cache
    if (redis) {
      try {
        const backup = await redis.get(CACHE_CONFIG.BACKUP_KEY);
        if (backup) {
          return new Response(JSON.stringify({ success: true, data: backup }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Cache': 'STALE_FALLBACK',
              'X-Response-Time': `${Date.now() - startTime}ms`
            }
          });
        }
      } catch (fallbackError) {
        console.error('[HOME API] Fallback failed:', fallbackError);
      }
    }
    
    // Final fallback: serve memory cache if available
    if (memoryCache) {
      return new Response(JSON.stringify({ success: true, data: memoryCache.data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': 'MEMORY_FALLBACK',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      });
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      }
    );
  }
};