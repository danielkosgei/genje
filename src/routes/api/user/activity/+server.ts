import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleLikes, articleBookmarks, articleComments } from '$lib/server/db/schema';
import { eq, desc, count, union } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const type = url.searchParams.get('type'); // 'likes', 'comments', 'bookmarks', or 'all'
		const offset = (page - 1) * limit;
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;
		let activities = [];

		if (type === 'likes' || !type) {
			// Get user's likes
			const likes = await db.select({
				id: articleLikes.id,
				articleId: articleLikes.articleId,
				createdAt: articleLikes.createdAt,
				type: 'like' as const
			})
			.from(articleLikes)
			.where(eq(articleLikes.userId, userId))
			.orderBy(desc(articleLikes.createdAt))
			.limit(type === 'likes' ? limit : 50);

			activities.push(...likes);
		}

		if (type === 'bookmarks' || !type) {
			// Get user's bookmarks
			const bookmarks = await db.select({
				id: articleBookmarks.id,
				articleId: articleBookmarks.articleId,
				createdAt: articleBookmarks.createdAt,
				type: 'bookmark' as const
			})
			.from(articleBookmarks)
			.where(eq(articleBookmarks.userId, userId))
			.orderBy(desc(articleBookmarks.createdAt))
			.limit(type === 'bookmarks' ? limit : 50);

			activities.push(...bookmarks);
		}

		if (type === 'comments' || !type) {
			// Get user's comments
			const comments = await db.select({
				id: articleComments.id,
				articleId: articleComments.articleId,
				createdAt: articleComments.createdAt,
				type: 'comment' as const,
				text: articleComments.text
			})
			.from(articleComments)
			.where(eq(articleComments.userId, userId))
			.orderBy(desc(articleComments.createdAt))
			.limit(type === 'comments' ? limit : 50);

			activities.push(...comments);
		}

		// Sort all activities by date and paginate
		activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		const paginatedActivities = activities.slice(offset, offset + limit);

		// Get total counts for each type
		const [likesCount] = await db.select({ count: count() })
			.from(articleLikes)
			.where(eq(articleLikes.userId, userId));

		const [bookmarksCount] = await db.select({ count: count() })
			.from(articleBookmarks)
			.where(eq(articleBookmarks.userId, userId));

		const [commentsCount] = await db.select({ count: count() })
			.from(articleComments)
			.where(eq(articleComments.userId, userId));

		return json({
			success: true,
			data: {
				activities: paginatedActivities.map(activity => ({
					id: activity.id.toString(),
					type: activity.type,
					articleId: activity.articleId,
					createdAt: activity.createdAt.toISOString(),
					...(activity.type === 'comment' && { text: activity.text })
				})),
				pagination: {
					page,
					limit,
					total: activities.length,
					hasMore: offset + paginatedActivities.length < activities.length
				},
				summary: {
					likes: likesCount.count,
					bookmarks: bookmarksCount.count,
					comments: commentsCount.count,
					total: likesCount.count + bookmarksCount.count + commentsCount.count
				}
			}
		});
	} catch (error) {
		console.error('Get user activity error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};