import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleBookmarks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id: articleId } = params;
		const { action } = await request.json(); // 'bookmark' or 'unbookmark'
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		if (action === 'bookmark') {
			// Add bookmark (ignore if already exists)
			await db.insert(articleBookmarks)
				.values({ userId, articleId })
				.onConflictDoNothing();
		} else if (action === 'unbookmark') {
			// Remove bookmark
			await db.delete(articleBookmarks)
				.where(and(
					eq(articleBookmarks.userId, userId),
					eq(articleBookmarks.articleId, articleId)
				));
		} else {
			return json({ error: 'Invalid action. Use "bookmark" or "unbookmark"' }, { status: 400 });
		}

		// Check if user has bookmarked this article
		const [userBookmark] = await db.select()
			.from(articleBookmarks)
			.where(and(
				eq(articleBookmarks.userId, userId),
				eq(articleBookmarks.articleId, articleId)
			));

		return json({
			success: true,
			data: {
				bookmarked: !!userBookmark
			}
		});
	} catch (error) {
		console.error('Bookmark API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { id: articleId } = params;
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Check if user has bookmarked this article
		const [userBookmark] = await db.select()
			.from(articleBookmarks)
			.where(and(
				eq(articleBookmarks.userId, userId),
				eq(articleBookmarks.articleId, articleId)
			));

		return json({
			success: true,
			data: {
				bookmarked: !!userBookmark
			}
		});
	} catch (error) {
		console.error('Get bookmark status error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};