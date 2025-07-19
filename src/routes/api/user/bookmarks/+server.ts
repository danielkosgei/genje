import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleBookmarks } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { newsAPI } from '$lib/api/news';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Get user's bookmarked article IDs
		const bookmarks = await db.select({
			articleId: articleBookmarks.articleId,
			createdAt: articleBookmarks.createdAt
		})
		.from(articleBookmarks)
		.where(eq(articleBookmarks.userId, userId))
		.orderBy(desc(articleBookmarks.createdAt))
		.limit(limit)
		.offset(offset);

		// Get total count for pagination
		const [totalCount] = await db.select({ count: count() })
			.from(articleBookmarks)
			.where(eq(articleBookmarks.userId, userId));

		// Fetch article details from the news API
		const articles = [];
		for (const bookmark of bookmarks) {
			try {
				const article = await newsAPI.getArticleById(parseInt(bookmark.articleId));
				articles.push(article);
			} catch (error) {
				console.error(`Failed to fetch article ${bookmark.articleId}:`, error);
				// Skip articles that can't be fetched (might be deleted)
			}
		}

		return json({
			success: true,
			data: {
				articles,
				pagination: {
					page,
					limit,
					total: totalCount.count,
					hasMore: offset + bookmarks.length < totalCount.count
				}
			}
		});
	} catch (error) {
		console.error('Get bookmarks error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};