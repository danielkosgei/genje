import genjeAPI from '$lib/api';

export async function load({ params, url }) {
  const articleId = params.id;
  
  try {
    // Fetch article data
    const response = await genjeAPI.getArticleById(articleId);
    
    if (response.success) {
      const articleData = response.data;
      
      // Return article data only (metadata is handled by layout.server.js)
      return {
        article: articleData
      };
    } else {
      // Return fallback data if article not found
      return {
        article: {
          id: articleId,
          title: `Article #${articleId}`,
          summary: `Read this interesting article on Genje News`,
          image_url: `https://picsum.photos/seed/${articleId}/1200/630`
        }
      };
    }
  } catch (error) {
    console.error('Error loading article:', error);
    
    // Return fallback data in case of error
    return {
      article: {
        id: articleId,
        title: `Article #${articleId}`,
        summary: `Read this interesting article on Genje News`,
        image_url: `https://picsum.photos/seed/${articleId}/1200/630`
      }
    };
  }
}