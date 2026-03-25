import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_ANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;
const redis = useRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const CACHE_TTL = 21600; // 6 hours in seconds (6 * 60 * 60)

export const GET: RequestHandler = async ({ url }) => {
  const date = url.searchParams.get('date');
  if (!date) {
    return new Response(JSON.stringify({ success: false, error: 'Date parameter is required' }), { status: 400 });
  }

  const CACHE_KEY = `schedule_${date}`;

  if (!useRedis) {
    console.warn('[SCHEDULE API] Redis not configured, passthrough mode.');
    try {
      const resp = await fetch(`${API_URL}/api/v2/hianime/schedule?date=${date}`);
      if (!resp.ok) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch schedule data' }), { status: resp.status });
      }
      const data = await resp.json();
      return new Response(JSON.stringify({ success: true, data: data.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' }
      });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
    }
  }

  // Try cache first
  const cached = await redis!.get(CACHE_KEY);
  if (cached) {
    return new Response(JSON.stringify({ success: true, data: cached }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }

  // If not cached, fetch and update cache
  try {
    const resp = await fetch(`${API_URL}/api/v2/hianime/schedule?date=${date}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch schedule data' }), { status: resp.status });
    }
    const data = await resp.json();

    // Validate data before caching
    if (
      !data ||
      !data.data ||
      (Array.isArray(data.data) && data.data.length === 0) ||
      (typeof data.data === 'object' && Object.keys(data.data).length === 0)
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or empty schedule data' }),
        { status: 500 }
      );
    }

    // Only cache if data is valid and not empty
    await redis!.set(CACHE_KEY, data.data, { ex: secondsUntilJapanMidnight() });
    return new Response(JSON.stringify({ success: true, data: data.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};

function secondsUntilJapanMidnight(): number {
  // Get current time in Asia/Tokyo
  const now = new Date();
  // Convert to Japan time (UTC+9)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const japanNow = new Date(utc + 9 * 60 * 60000);

  // Next midnight in Japan
  const nextMidnight = new Date(japanNow);
  nextMidnight.setHours(24, 0, 0, 0);

  // Seconds until next midnight
  return Math.floor((nextMidnight.getTime() - japanNow.getTime()) / 1000);
}