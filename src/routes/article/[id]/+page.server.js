import { error } from '@sveltejs/kit';
import genjeAPI from '$lib/api.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    const articleId = params.id;
    
    // Try to fetch the article data from our API
    try {
      const articleResponse = await genjeAPI.getArticleById(articleId);
      
      if (articleResponse.success && articleResponse.data) {
        return { 
          article: articleResponse.data 
        };
      }
    } catch (e) {
      console.error('Error fetching article data:', e);
    }
    
    // If we can't get the article data, create a more specific mock
    // based on the article ID to ensure consistency
    const mockArticle = {
      id: parseInt(articleId),
      title: `Article #${articleId}`,
      summary: `This is article #${articleId} on Genje News. Click to read the full content.`,
      content: `<p>This is the content of article #${articleId}.</p>`,
      author: "Genje News",
      source: "Genje News",
      published_at: new Date().toISOString(),
      category: "News",
      image_url: `https://picsum.photos/seed/${articleId}/1200/630`,
      url: `/article/${articleId}`
    };
    
    return { article: mockArticle };
  } catch (err) {
    throw error(404, 'Article not found');
  }
}