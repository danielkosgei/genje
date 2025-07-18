import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { topicAnalytics } from '$lib/server/topicAnalytics';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { articles } = await request.json();
		
		if (!articles || !Array.isArray(articles)) {
			return json({ error: 'Invalid articles data' }, { status: 400 });
		}

		// Validate article structure
		const validArticles = articles.filter(article => 
			article.id && 
			article.title && 
			article.content && 
			article.published_at
		);

		if (validArticles.length === 0) {
			return json({ error: 'No valid articles to analyze' }, { status: 400 });
		}

		// Analyze the articles
		validArticles.forEach(article => {
			topicAnalytics.analyzeArticle({
				id: article.id.toString(),
				title: article.title,
				content: article.content,
				category: article.category || 'general',
				published_at: article.published_at
			});
		});

		return json({
			success: true,
			analyzed: validArticles.length,
			skipped: articles.length - validArticles.length,
			analytics: topicAnalytics.getAnalyticsSnapshot()
		});
	} catch (error) {
		console.error('Error analyzing articles:', error);
		return json({ error: 'Failed to analyze articles' }, { status: 500 });
	}
};