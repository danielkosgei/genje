import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
  try {
    const articleId = params.id;
    
    // Try to fetch the article data from our API
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        return { article };
      }
    } catch (e) {
      console.error('Error fetching article data:', e);
    }
    
    // Fallback to mock data if API call fails
    return {
      article: {
        id: articleId,
        title: "Genje News Article",
        summary: "Read this interesting article on Genje News",
        image_url: "https://picsum.photos/1200/630",
        url: `/article/${articleId}`
      }
    };
  } catch (err) {
    throw error(404, 'Article not found');
  }
}