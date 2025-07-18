import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchAnalytics } from '$lib/server/searchAnalytics';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, timestamp } = await request.json();
		
		if (!query || typeof query !== 'string') {
			return json({ error: 'Invalid query' }, { status: 400 });
		}

		// Track the search using our analytics service
		const wasTracked = searchAnalytics.trackSearch(query, new Date(timestamp));

		return json({ 
			success: true, 
			tracked: wasTracked,
			totalSearches: searchAnalytics.getTotalSearches()
		});
	} catch (error) {
		console.error('Error tracking search:', error);
		return json({ error: 'Failed to track search' }, { status: 500 });
	}
};