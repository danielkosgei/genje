import { error } from '@sveltejs/kit';
import genjeAPI from '$lib/api.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, url }) {
  try {
    const articleId = params.id;
    let article;
    
    // Try to fetch the article data from our API
    try {
      const articleResponse = await genjeAPI.getArticleById(articleId);
      
      if (articleResponse.success && articleResponse.data) {
        article = articleResponse.data;
      }
    } catch (e) {
      console.error('Error fetching article data:', e);
    }
    
    // If we can't get the article data, create a more specific mock
    if (!article) {
      article = {
        id: parseInt(articleId),
        title: `Article #${articleId}`,
        summary: `This is article #${articleId} on Genje News. Click to read the full content.`,
        content: `<p>This is the content of article #${articleId}.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>`,
        author: "Genje News",
        source: "Genje News",
        published_at: new Date().toISOString(),
        category: "News",
        image_url: `https://picsum.photos/seed/${articleId}/1200/630`,
        url: `/article/${articleId}`
      };
    }
    
    // Process the article data for metadata
    let description = article.summary;
    if (!description && article.content) {
      // Remove HTML tags and limit to 200 characters
      description = article.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200) + '...';
    }
    
    // Ensure image URL is absolute
    let imageUrl = article.image_url;
    if (imageUrl && !imageUrl.startsWith('http')) {
      const origin = url.origin;
      imageUrl = `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    } else if (!imageUrl) {
      imageUrl = `https://picsum.photos/seed/${articleId}/1200/630`;
    }
    
    return { 
      article,
      metadata: {
        title: article.title,
        description,
        imageUrl,
        url: `${url.origin}/article/${articleId}`
      }
    };
  } catch (err) {
    console.error('Error in page.server.js:', err);
    throw error(404, 'Article not found');
  }
}