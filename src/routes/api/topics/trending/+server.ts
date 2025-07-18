import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { topicAnalytics } from '$lib/server/topicAnalytics';
import { newsAPI } from '$lib/api/news';

export const GET: RequestHandler = async () => {
	try {
		// Get recent articles to analyze
		const articlesResponse = await newsAPI.getRecentArticles(100); // Analyze last 100 articles
		
		if (articlesResponse.success && articlesResponse.data) {
			// Analyze the articles for trending topics
			topicAnalytics.analyzeArticles(articlesResponse.data);
		}

		// Get trending topics
		const trendingTopics = topicAnalytics.getTrendingTopics(8);

		// If we don't have enough trending topics, provide some fallback topics
		if (trendingTopics.length < 4) {
			const fallbackTopics = [
				{ name: 'Politics', count: 15, trend: 'stable' as const, color: 'bg-blue-500/10 text-blue-600' },
				{ name: 'Business', count: 12, trend: 'up' as const, color: 'bg-green-500/10 text-green-600' },
				{ name: 'Sports', count: 8, trend: 'stable' as const, color: 'bg-orange-500/10 text-orange-600' },
				{ name: 'Education', count: 6, trend: 'down' as const, color: 'bg-purple-500/10 text-purple-600' }
			];

			// Combine real trending topics with fallbacks
			const combinedTopics = [
				...trendingTopics,
				...fallbackTopics.filter(fallback => 
					!trendingTopics.some(trending => trending.name.toLowerCase() === fallback.name.toLowerCase())
				)
			].slice(0, 8);

			return json({
				topics: combinedTopics,
				source: 'mixed',
				lastUpdated: new Date().toISOString(),
				analytics: topicAnalytics.getAnalyticsSnapshot()
			});
		}

		return json({
			topics: trendingTopics,
			source: 'analytics',
			lastUpdated: new Date().toISOString(),
			analytics: topicAnalytics.getAnalyticsSnapshot()
		});
	} catch (error) {
		console.error('Error fetching trending topics:', error);
		
		// Return fallback topics if there's an error
		const fallbackTopics = [
			{ name: 'Breaking News', count: 20, trend: 'up' as const, color: 'bg-red-500/10 text-red-600' },
			{ name: 'Politics', count: 15, trend: 'stable' as const, color: 'bg-blue-500/10 text-blue-600' },
			{ name: 'Business', count: 12, trend: 'up' as const, color: 'bg-green-500/10 text-green-600' },
			{ name: 'Sports', count: 8, trend: 'stable' as const, color: 'bg-orange-500/10 text-orange-600' },
			{ name: 'Technology', count: 6, trend: 'up' as const, color: 'bg-indigo-500/10 text-indigo-600' },
			{ name: 'Education', count: 5, trend: 'down' as const, color: 'bg-purple-500/10 text-purple-600' }
		];

		return json({
			topics: fallbackTopics,
			source: 'fallback',
			lastUpdated: new Date().toISOString(),
			error: 'Failed to analyze articles'
		});
	}
};