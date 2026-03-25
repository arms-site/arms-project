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
  const id = params.id;
  const page = url.searchParams.get('page') || '1';

  if (!id) {
    console.error('Missing brand id parameter');
    return new Response(JSON.stringify({ status: 'error', error: 'Missing brand id parameter' }), { status: 400 });
  }

  const CACHE_KEY = `hanime_brand_${id}_${page}_v1`;

  // Helper to transform new API format to expected format
  function transformResults(apiResponse: any) {
    const results = apiResponse?.data?.data?.results || [];
    const pagination = apiResponse?.data?.data?.pagination || {};
    
    // Transform each result to match expected format
    const transformed = results.map((item: any) => ({
      id: item.slug || '',
      title: item.title || '',
      image: item.posterUrl || item.imageUrl || '',
      duration: item.duration || '--:--',
      views: 0,
      slug: item.slug || '',
      year: item.year || null,
      rating: item.rating || null
    }));

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

    return {
      status: 'success',
      data: {
        results: transformed,
        currentPage,
        totalPages
      }
    };
  }

  try {
    if (!redis) {
      console.log('Redis not configured, fetching from API');
      const apiUrl = `${API_URL}/api/hen/mama/studio/${encodeURIComponent(id)}?page=${page}`;
      console.log('Fetching from:', apiUrl);
      const resp = await fetch(apiUrl);
      if (!resp.ok) {
        console.error('API fetch failed', resp.status);
        return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch brand data' }), { status: resp.status });
      }
      const data = await resp.json();
      const transformed = transformResults(data);

      return new Response(JSON.stringify(transformed), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'NONE' }
      });
    }

    // Try cache first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log('Cache HIT');
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
      });
    }

    // Cache miss: fetch and cache
    console.log('Cache MISS, fetching from API');
    const apiUrl = `${API_URL}/api/hen/mama/studio/${encodeURIComponent(id)}?page=${page}`;
    console.log('Fetching from:', apiUrl);
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      console.error('API fetch failed', resp.status);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch brand data' }), { status: resp.status });
    }
    const data = await resp.json();
    const transformed = transformResults(data);

    await redis.set(CACHE_KEY, transformed, { ex: CACHE_TTL });
    return new Response(JSON.stringify(transformed), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (error) {
    console.error('Internal server error', error);
    return new Response(JSON.stringify({ status: 'error', error: 'Internal server error' }), { status: 500 });
  }
};