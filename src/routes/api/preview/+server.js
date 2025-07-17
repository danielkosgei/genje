import { json } from '@sveltejs/kit';
import genjeAPI from '$lib/api';

export async function GET({ url, params }) {
  const articleId = url.searchParams.get('id');
  try {
    // Try to fetch the article data
    const response = await genjeAPI.getArticleById(articleId);
    let article;
    if (response.success) {
      article = response.data;
    } else {
      // Fallback data if article not found
      article = {
        id: articleId,
        title: `Article #${articleId}`,
        summary: `Read this interesting article on Genje News`,
        image_url: `https://picsum.photos/seed/${articleId}/1200/630`
      };
    }
    // Return the preview data
    return json({
      title: article.title,
      description: article.summary,
      image: article.image_url,
      url: `${url.origin}/article/${articleId}`
    });
  } catch (error) {
    return json({
      title: "Genje News Article",
      description: "Read this interesting article on Genje News",
      image: `https://picsum.photos/seed/${articleId}/1200/630`,
      url: `${url.origin}/article/${articleId}`
    });
  }
}