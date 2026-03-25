import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_ANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;
const redis = useRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const CACHE_TTL = 1800; // 30 minutes

export const GET: RequestHandler = async ({ params, url }) => {
  const name = params.name;
  const page = url.searchParams.get('page') || '1';

  if (!name) {
    return new Response(
      JSON.stringify({ success: false, error: 'Producer name is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!API_URL) {
    console.error('VITE_ANIME_API environment variable is not set');
    return new Response(
      JSON.stringify({ success: false, error: 'API configuration error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const CACHE_KEY = `producer_${name}_page_${page}_v1`;

  // If Redis is not configured, passthrough mode (no caching)
  if (!redis) {
    try {
      const apiUrl = `${API_URL}/api/v2/hianime/producer/${encodeURIComponent(name)}?page=${page}`;
      const resp = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!resp.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to fetch producer data: ${resp.status} ${resp.statusText}`
          }),
          {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await resp.json();
      if (
        !data ||
        !data.data ||
        (Array.isArray(data.data) && data.data.length === 0) ||
        (typeof data.data === 'object' && Object.keys(data.data).length === 0)
      ) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or empty API response format' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: data.data }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Try cache first
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return new Response(
      JSON.stringify({ success: true, data: cached }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      }
    );
  }

  // Cache miss: fetch and cache
  try {
    const apiUrl = `${API_URL}/api/v2/hianime/producer/${encodeURIComponent(name)}?page=${page}`;
    const resp = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch producer data: ${resp.status} ${resp.statusText}`
        }),
        {
          status: resp.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await resp.json();
    if (
      !data ||
      !data.data ||
      (Array.isArray(data.data) && data.data.length === 0) ||
      (typeof data.data === 'object' && Object.keys(data.data).length === 0)
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or empty API response format' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Only cache if data is valid and not empty
    await redis.set(CACHE_KEY, data.data, { ex: CACHE_TTL });
    return new Response(
      JSON.stringify({ success: true, data: data.data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};