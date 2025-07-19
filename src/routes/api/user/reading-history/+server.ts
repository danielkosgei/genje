import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { readingHistory } from '$lib/server/db/schema';
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

		// Get user's reading history
		const history = await db.select({
			articleId: readingHistory.articleId,
			readAt: readingHistory.readAt,
			readDuration: readingHistory.readDuration,
			readPercentage: readingHistory.readPercentage
		})
		.from(readingHistory)
		.where(eq(readingHistory.userId, userId))
		.orderBy(desc(readingHistory.readAt))
		.limit(limit)
		.offset(offset);

		// Get total count for pagination
		const [totalCount] = await db.select({ count: count() })
			.from(readingHistory)
			.where(eq(readingHistory.userId, userId));

		// Fetch article details from the news API
		const articles = [];
		for (const item of history) {
			try {
				const article = await newsAPI.getArticleById(parseInt(item.articleId));
				articles.push({
					...article,
					readAt: item.readAt.toISOString(),
					readDuration: item.readDuration,
					readPercentage: item.readPercentage
				});
			} catch (error) {
				console.error(`Failed to fetch article ${item.articleId}:`, error);
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
					hasMore: offset + history.length < totalCount.count
				}
			}
		});
	} catch (error) {
		console.error('Get reading history error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { articleId, readDuration, readPercentage } = await request.json();
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Insert or update reading history
		await db.insert(readingHistory)
			.values({
				userId,
				articleId: articleId.toString(),
				readDuration: readDuration || null,
				readPercentage: readPercentage || null
			})
			.onConflictDoUpdate({
				target: [readingHistory.userId, readingHistory.articleId],
				set: {
					readAt: new Date(),
					readDuration: readDuration || null,
					readPercentage: readPercentage || null
				}
			});

		return json({
			success: true,
			data: { message: 'Reading history updated' }
		});
	} catch (error) {
		console.error('Update reading history error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};