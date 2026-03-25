import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_ANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;
const redis = useRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const CACHE_TTL = 3600; // 1 hour in seconds

export const GET: RequestHandler = async ({ url }) => {
  const page = url.searchParams.get('page') || '1';
  const CACHE_KEY = `most_popular_data_v1_page_${page}`;

  if (!redis) {
    console.warn('[MOST-POPULAR API] Redis not configured, passthrough mode.');
    try {
      const resp = await fetch(`${API_URL}/api/v2/hianime/most-popular?page=${page}`);
      if (!resp.ok) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch most popular anime data' }), { status: resp.status });
      }
      const data = await resp.json();
      return new Response(JSON.stringify({ success: true, data: data.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
    }
  }

  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return new Response(JSON.stringify({ success: true, data: cached }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }

  try {
    const resp = await fetch(`${API_URL}/api/v2/hianime/most-popular?page=${page}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch most popular anime data' }), { status: resp.status });
    }
    const data = await resp.json();
    await redis.set(CACHE_KEY, data.data, { ex: CACHE_TTL });
    return new Response(JSON.stringify({ success: true, data: data.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};