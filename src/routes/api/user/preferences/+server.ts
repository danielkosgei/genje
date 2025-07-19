import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userPreferences } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Get user preferences
		const [preferences] = await db.select()
			.from(userPreferences)
			.where(eq(userPreferences.userId, userId));

		// Return default preferences if none exist
		const defaultPreferences = {
			emailNotifications: 'weekly',
			pushNotifications: 'important',
			preferredLanguage: 'en',
			preferredCategories: '[]',
			theme: 'system',
			timezone: 'Africa/Nairobi'
		};

		return json({
			success: true,
			data: preferences || defaultPreferences
		});
	} catch (error) {
		console.error('Get preferences error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const updates = await request.json();
		
		// Check if user is authenticated
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Validate the updates
		const allowedFields = [
			'emailNotifications',
			'pushNotifications', 
			'preferredLanguage',
			'preferredCategories',
			'theme',
			'timezone'
		];

		const validUpdates = {};
		for (const [key, value] of Object.entries(updates)) {
			if (allowedFields.includes(key)) {
				validUpdates[key] = value;
			}
		}

		// Insert or update preferences
		await db.insert(userPreferences)
			.values({
				userId,
				...validUpdates,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: userPreferences.userId,
				set: {
					...validUpdates,
					updatedAt: new Date()
				}
			});

		return json({
			success: true,
			data: { message: 'Preferences updated successfully' }
		});
	} catch (error) {
		console.error('Update preferences error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};