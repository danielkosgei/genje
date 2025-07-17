import genjeAPI from '$lib/api';

// This layout server will ensure metadata is available for all article routes
export async function load({ params, url }) {
  const articleId = params.id;
  
  try {
    // Fetch article data
    const response = await genjeAPI.getArticleById(articleId);
    
    if (response.success) {
      const articleData = response.data;
      
      // Return metadata for server-side rendering
      return {
        metadata: {
          title: articleData.title || `Article #${articleId}`,
          description: articleData.summary || `Read this interesting article on Genje News`,
          image: articleData.image_url || `https://picsum.photos/seed/${articleId}/1200/630`,
          url: `${url.origin}/article/${articleId}`
        }
      };
    } else {
      // Return fallback data if article not found
      return {
        metadata: {
          title: `Article #${articleId}`,
          description: `Read this interesting article on Genje News`,
          image: `https://picsum.photos/seed/${articleId}/1200/630`,
          url: `${url.origin}/article/${articleId}`
        }
      };
    }
  } catch (error) {
    console.error('Error loading article metadata:', error);
    
    // Return fallback data in case of error
    return {
      metadata: {
        title: `Article #${articleId}`,
        description: `Read this interesting article on Genje News`,
        image: `https://picsum.photos/seed/${articleId}/1200/630`,
        url: `${url.origin}/article/${articleId}`
      }
    };
  }
}