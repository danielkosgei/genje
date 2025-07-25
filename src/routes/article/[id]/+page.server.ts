import type { PageServerLoad } from './$types';
import { newsAPI } from '$lib/api/news';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    throw error(404, 'Invalid article ID');
  }

  try {
    const article = await newsAPI.getArticleById(id);
    
    return {
      article,
      user: locals.user || null
    };
  } catch (err) {
    console.error('Failed to load article:', err);
    throw error(404, 'Article not found');
  }
};