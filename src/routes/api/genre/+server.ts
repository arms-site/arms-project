import type { RequestHandler } from '@sveltejs/kit';

const API_URL = import.meta.env.VITE_ANIME_API || '';

export const GET: RequestHandler = async ({ params, url }) => {
  const { name } = params;
  const page = url.searchParams.get('page') || '1';

  try {
    const resp = await fetch(`${API_URL}/api/v2/hianime/genre/${name}?page=${page}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch genre animes' }), { status: resp.status });
    }
    const data = await resp.json();
    return new Response(JSON.stringify({ success: true, data: data.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};