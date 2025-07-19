import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		console.log('Profile layout: No user found, redirecting to login');
		throw redirect(302, '/auth/login');
	}

	console.log('Profile layout: User authenticated:', locals.user.username);
	
	return {
		user: locals.user
	};
};