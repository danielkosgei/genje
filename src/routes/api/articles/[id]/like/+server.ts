import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleLikes } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id: articleId } = params;
		const { action } = await request.json(); // 'like' or 'unlike'
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		if (action === 'like') {
			// Add like (ignore if already exists)
			await db.insert(articleLikes)
				.values({ userId, articleId })
				.onConflictDoNothing();
		} else if (action === 'unlike') {
			// Remove like
			await db.delete(articleLikes)
				.where(and(
					eq(articleLikes.userId, userId),
					eq(articleLikes.articleId, articleId)
				));
		} else {
			return json({ error: 'Invalid action. Use "like" or "unlike"' }, { status: 400 });
		}

		// Get updated like count and user's like status
		const [likesCount] = await db.select({ count: count() })
			.from(articleLikes)
			.where(eq(articleLikes.articleId, articleId));

		const [userLike] = await db.select()
			.from(articleLikes)
			.where(and(
				eq(articleLikes.userId, userId),
				eq(articleLikes.articleId, articleId)
			));

		return json({
			success: true,
			data: {
				liked: !!userLike,
				likesCount: likesCount.count
			}
		});
	} catch (error) {
		console.error('Like API error:', error);
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

		// Get like count for article
		const [likesCount] = await db.select({ count: count() })
			.from(articleLikes)
			.where(eq(articleLikes.articleId, articleId));

		// Check if user has liked this article
		const [userLike] = await db.select()
			.from(articleLikes)
			.where(and(
				eq(articleLikes.userId, userId),
				eq(articleLikes.articleId, articleId)
			));

		return json({
			success: true,
			data: {
				liked: !!userLike,
				likesCount: likesCount.count
			}
		});
	} catch (error) {
		console.error('Get like status error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};