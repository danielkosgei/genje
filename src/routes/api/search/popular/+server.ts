import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchAnalytics } from '$lib/server/searchAnalytics';

export const GET: RequestHandler = async () => {
	try {
		// Get the most popular searches from the last 30 days
		const popularSearches = searchAnalytics.getPopularSearches(10, 30);

		// If we don't have enough data, provide some fallback searches
		if (popularSearches.length < 5) {
			const fallbackSearches = [
				'Breaking news Kenya',
				'Nairobi updates',
				'Kenya politics',
				'Business news',
				'Sports Kenya',
				'Kenya weather',
				'Education Kenya',
				'Health news Kenya'
			];
			
			// Combine existing popular searches with fallbacks, avoiding duplicates
			const combinedSearches = [
				...popularSearches,
				...fallbackSearches.filter(search => !popularSearches.includes(search))
			].slice(0, 8);

			return json({ 
				searches: combinedSearches,
				source: 'mixed', // indicates we're using both real data and fallbacks
				totalTracked: searchAnalytics.getTotalSearches()
			});
		}

		return json({ 
			searches: popularSearches,
			source: 'analytics', // indicates this is real user data
			totalTracked: searchAnalytics.getTotalSearches()
		});
	} catch (error) {
		console.error('Error fetching popular searches:', error);
		
		// Return fallback searches if there's an error
		return json({ 
			searches: [
				'Breaking news Kenya',
				'Nairobi updates',
				'Kenya politics',
				'Business news',
				'Sports Kenya'
			],
			source: 'fallback',
			totalTracked: 0
		});
	}
};