import type { RequestHandler } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const API_URL = import.meta.env.VITE_HANIME_API || '';
const REDIS_URL = import.meta.env.VITE_REDIS_URL;
const REDIS_TOKEN = import.meta.env.VITE_REDIS_TOKEN;

const useRedis = !!REDIS_URL && !!REDIS_TOKEN;
const redis = useRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const CACHE_TTL = 900; // 15 minutes

export const GET: RequestHandler = async ({ params, url }) => {
  const genre = params.genre;
  const page = url.searchParams.get('page') || '1';

  if (!genre) {
    return new Response(JSON.stringify({ status: 'error', error: 'Missing genre parameter' }), { status: 400 });
  }

  const CACHE_KEY = `hanime_genre_${genre}_${page}_v1`;

  if (!redis) {
    try {
      const resp = await fetch(`${API_URL}/api/hen/mama/genre/${encodeURIComponent(genre)}/${encodeURIComponent(page)}`);
      if (!resp.ok) {
        return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch genre data' }), { status: resp.status });
      }
      const apiJson = await resp.json();

      // Extract nested data structure: data -> data -> { results, pagination }
      const dataContent = apiJson?.data?.data ?? apiJson?.data ?? apiJson;
      const resultsRaw: any[] = dataContent?.results || [];
      const pagination = dataContent?.pagination || {};

      // Map upstream result fields to the frontend-friendly shape
      const results = resultsRaw.map((item: any) => ({
        id: item.slug || item.id || item.seriesId || '',
        image: item.posterUrl || item.imageUrl || item.featuredImageUrl || item.image || '',
        title: item.title || item.name || '',
        duration: item.duration || item.runTime || '--:--',
        views: item.views || item.viewCount || 0,
        rating: item.rating || null,
        year: item.year || null,
        genres: item.genres || item.categories || []
      }));

      // Extract pagination info
      const currentPage = pagination?.currentPage ?? 1;
      let totalPages = pagination?.totalPages ?? 1;
      const hasNextPage = pagination?.hasNextPage ?? false;

      // Recalculate totalPages if needed based on pagination indicators
      if ((!totalPages || currentPage >= totalPages) && hasNextPage) {
        totalPages = currentPage + 1;
      }
      if (currentPage > 1 && totalPages < currentPage) {
        totalPages = currentPage + (hasNextPage ? 1 : 0);
      }

      return new Response(JSON.stringify({ status: 'success', data: { results, currentPage, totalPages } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ status: 'error', error: 'Internal server error' }), { status: 500 });
    }
  }

  // Try cache first
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }

  // Cache miss: fetch and cache
  try {
    const resp = await fetch(`${API_URL}/api/hen/mama/genre/${encodeURIComponent(genre)}/${encodeURIComponent(page)}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch genre data' }), { status: resp.status });
    }
    const apiJson = await resp.json();

    // Extract nested data structure: data -> data -> { results, pagination }
    const dataContent = apiJson?.data?.data ?? apiJson?.data ?? apiJson;
    const resultsRaw: any[] = dataContent?.results || [];
    const pagination = dataContent?.pagination || {};

    // Map upstream result fields to the frontend-friendly shape
    const results = resultsRaw.map((item: any) => ({
      id: item.slug || item.id || item.seriesId || '',
      image: item.posterUrl || item.imageUrl || item.featuredImageUrl || item.image || '',
      title: item.title || item.name || '',
      duration: item.duration || item.runTime || '--:--',
      views: item.views || item.viewCount || 0,
      rating: item.rating || null,
      year: item.year || null,
      genres: item.genres || item.categories || []
    }));

    // Extract pagination info
    const currentPage = pagination?.currentPage ?? 1;
    let totalPages = pagination?.totalPages ?? 1;
    const hasNextPage = pagination?.hasNextPage ?? false;

    // Recalculate totalPages if needed based on pagination indicators
    if ((!totalPages || currentPage >= totalPages) && hasNextPage) {
      totalPages = currentPage + 1;
    }
    if (currentPage > 1 && totalPages < currentPage) {
      totalPages = currentPage + (hasNextPage ? 1 : 0);
    }

    const normalizedData = {
      status: 'success',
      data: {
        results,
        currentPage,
        totalPages
      }
    };

    await redis.set(CACHE_KEY, normalizedData, { ex: CACHE_TTL });
    return new Response(JSON.stringify(normalizedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', error: 'Internal server error' }), { status: 500 });
  }
};