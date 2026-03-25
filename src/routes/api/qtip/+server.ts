import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_ANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;
const redis = useRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const CACHE_TTL_QTIP = 3600; // 1 hour in seconds

export const GET: RequestHandler = async ({ url }) => {
  const animeId = url.searchParams.get('id');
  if (!animeId) {
    return new Response(JSON.stringify({ success: false, error: 'Missing anime id' }), { status: 400 });
  }

  const cacheKey = `qtip_${animeId}`;

  // If Redis is not configured, passthrough mode (no caching)
  if (!redis) {
    try {
      const resp = await fetch(`${API_URL}/api/v2/hianime/qtip/${animeId}`);
      if (!resp.ok) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch anime qtip data' }), { status: resp.status });
      }
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
    }
  }

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ success: true, data: cached }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }

  // Cache miss: fetch from API and cache the result
  try {
    const resp = await fetch(`${API_URL}/api/v2/hianime/qtip/${animeId}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch anime qtip data' }), { status: resp.status });
    }
    const data = await resp.json();

    // Validate data before saving to Redis
    if (
      !data ||
      !data.data ||
      !data.data.anime ||
      Object.keys(data.data.anime).length === 0
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or empty qtip data' }),
        { status: 500 }
      );
    }

    await redis.set(cacheKey, data.data, { ex: CACHE_TTL_QTIP });
    return new Response(JSON.stringify({ success: true, data: data.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};