import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleLikes, articleBookmarks, articleComments, readingHistory } from '$lib/server/db/schema';
import { eq, count, desc, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Get all stats in parallel
		const [
			likesCount,
			bookmarksCount,
			commentsCount,
			articlesReadCount,
			recentActivity,
			readingStreak
		] = await Promise.all([
			// Total likes
			db.select({ count: count() })
				.from(articleLikes)
				.where(eq(articleLikes.userId, userId)),
			
			// Total bookmarks
			db.select({ count: count() })
				.from(articleBookmarks)
				.where(eq(articleBookmarks.userId, userId)),
			
			// Total comments
			db.select({ count: count() })
				.from(articleComments)
				.where(eq(articleComments.userId, userId)),
			
			// Total articles read
			db.select({ count: count() })
				.from(readingHistory)
				.where(eq(readingHistory.userId, userId)),
			
			// Recent activity (last 30 days)
			db.select({
				date: sql<string>`DATE(${readingHistory.readAt})`,
				count: count()
			})
				.from(readingHistory)
				.where(eq(readingHistory.userId, userId))
				.where(sql`${readingHistory.readAt} >= NOW() - INTERVAL '30 days'`)
				.groupBy(sql`DATE(${readingHistory.readAt})`)
				.orderBy(desc(sql`DATE(${readingHistory.readAt})`)),
			
			// Reading streak calculation
			db.select({
				date: sql<string>`DATE(${readingHistory.readAt})`
			})
				.from(readingHistory)
				.where(eq(readingHistory.userId, userId))
				.groupBy(sql`DATE(${readingHistory.readAt})`)
				.orderBy(desc(sql`DATE(${readingHistory.readAt})`))
				.limit(30)
		]);

		// Calculate reading streak
		let streak = 0;
		if (readingStreak.length > 0) {
			const today = new Date();
			const dates = readingStreak.map(item => new Date(item.date));
			
			// Check if user read today or yesterday
			const todayStr = today.toISOString().split('T')[0];
			const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			
			if (dates.some(date => date.toISOString().split('T')[0] === todayStr) ||
				dates.some(date => date.toISOString().split('T')[0] === yesterdayStr)) {
				
				// Calculate consecutive days
				let currentDate = new Date(dates[0]);
				for (let i = 0; i < dates.length; i++) {
					const expectedDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
					const expectedDateStr = expectedDate.toISOString().split('T')[0];
					
					if (dates.some(date => date.toISOString().split('T')[0] === expectedDateStr)) {
						streak++;
					} else {
						break;
					}
				}
			}
		}

		// Determine favorite category (mock for now - would need article category tracking)
		const favoriteCategories = ['Politics', 'Business', 'Sports', 'Technology', 'Health'];
		const favoriteCategory = favoriteCategories[Math.floor(Math.random() * favoriteCategories.length)];

		return json({
			success: true,
			data: {
				articlesRead: articlesReadCount[0].count,
				articlesLiked: likesCount[0].count,
				commentsPosted: commentsCount[0].count,
				bookmarksSaved: bookmarksCount[0].count,
				readingStreak: streak,
				favoriteCategory,
				recentActivity: recentActivity.map(item => ({
					date: item.date,
					articlesRead: item.count
				}))
			}
		});
	} catch (error) {
		console.error('Get user stats error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};