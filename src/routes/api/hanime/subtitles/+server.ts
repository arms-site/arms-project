import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
    const subtitleUrl = url.searchParams.get('url');
    
    if (!subtitleUrl) {
        throw error(400, 'URL parameter is required');
    }

    try {
        const response = await fetch(subtitleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch subtitle');
        }

        const text = await response.text();
        
        return new Response(text, {
            headers: {
                'Content-Type': 'text/vtt',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (err) {
        console.error('Subtitle proxy error:', err);
        throw error(500, 'Failed to proxy subtitle');
    }
};