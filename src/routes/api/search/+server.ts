import type { RequestHandler } from '@sveltejs/kit';

const API_URL = import.meta.env.VITE_ANIME_API || '';

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q');
  const page = url.searchParams.get('page') || '1';
  const genres = url.searchParams.get('genres');
  const type = url.searchParams.get('type'); // Differentiates between "search" and "suggestion"
  const status = url.searchParams.get('status');
  const rated = url.searchParams.get('rated');
  const score = url.searchParams.get('score');
  const season = url.searchParams.get('season');
  const language = url.searchParams.get('language');
  const start_date = url.searchParams.get('start_date');
  const end_date = url.searchParams.get('end_date');
  const sort = url.searchParams.get('sort');

  if (!query) {
    return new Response(
      JSON.stringify({ success: false, error: 'Query parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let apiUrl: string;

    if (type === 'suggestion') {
      // Search suggestions endpoint
      apiUrl = `${API_URL}/api/v2/hianime/search/suggestion?q=${encodeURIComponent(query)}`;
    } else {
      // Search results endpoint
      const params = new URLSearchParams({
        q: query,
        page,
      });

      // Add optional parameters if they exist
      if (genres) params.append('genres', genres);
      if (status) params.append('status', status);
      if (rated) params.append('rated', rated);
      if (score) params.append('score', score);
      if (season) params.append('season', season);
      if (language) params.append('language', language);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      if (sort) params.append('sort', sort);

      apiUrl = `${API_URL}/api/v2/hianime/search?${params.toString()}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch data' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const json = await response.json();
    return new Response(
      JSON.stringify({ success: true, data: json.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in API handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};