import type { RequestHandler } from '@sveltejs/kit';

const API_URL = import.meta.env.VITE_ANIME_API || '';

export const GET: RequestHandler = async ({ params, url }) => {
  const { name } = params; // Extract the dynamic `name` parameter
  const page = url.searchParams.get('page') || '1';

  // Validate the `name` parameter
  if (!name) {
    return new Response(JSON.stringify({ success: false, error: 'Genre name is required' }), { status: 400 });
  }

  try {
    const resp = await fetch(`${API_URL}/api/v2/hianime/genre/${name}?page=${page}`);
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch genre animes' }), { status: resp.status });
    }

    const data = await resp.json();

    // Validate the response structure and content
    if (
      !data ||
      !data.data ||
      !data.data.animes ||
      !Array.isArray(data.data.animes) ||
      data.data.animes.length === 0
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or empty response structure' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: data.data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};