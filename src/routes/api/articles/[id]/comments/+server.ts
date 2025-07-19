import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { articleComments, user } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const { id: articleId } = params;
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;
		
		// Get comments for this article with user info
		const comments = await db.select({
			id: articleComments.id,
			text: articleComments.text,
			createdAt: articleComments.createdAt,
			author: {
				id: user.id,
				username: user.username
			}
		})
		.from(articleComments)
		.innerJoin(user, eq(articleComments.userId, user.id))
		.where(eq(articleComments.articleId, articleId))
		.orderBy(desc(articleComments.createdAt))
		.limit(limit)
		.offset(offset);

		// Get total count for pagination
		const [totalCount] = await db.select({ count: count() })
			.from(articleComments)
			.where(eq(articleComments.articleId, articleId));

		return json({
			success: true,
			data: {
				comments: comments.map(comment => ({
					id: comment.id.toString(),
					text: comment.text,
					author: comment.author,
					timestamp: comment.createdAt.toISOString()
				})),
				pagination: {
					page,
					limit,
					total: totalCount.count,
					hasMore: offset + comments.length < totalCount.count
				}
			}
		});
	} catch (error) {
		console.error('Get comments error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id: articleId } = params;
		const { text } = await request.json();
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		if (!text || !text.trim()) {
			return json({ error: 'Comment text is required' }, { status: 400 });
		}

		const userId = locals.user.id;

		// Insert new comment
		const [newComment] = await db.insert(articleComments)
			.values({
				userId,
				articleId,
				text: text.trim()
			})
			.returning();

		return json({
			success: true,
			data: {
				id: newComment.id.toString(),
				text: newComment.text,
				timestamp: newComment.createdAt.toISOString()
			}
		});
	} catch (error) {
		console.error('Submit comment error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};