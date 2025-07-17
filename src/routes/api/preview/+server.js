import { json } from '@sveltejs/kit';

/**
 * This endpoint generates link preview data for social media platforms
 * @param {Object} event - The request event
 */
export async function GET({ url }) {
  const articleId = url.searchParams.get('id');
  const title = url.searchParams.get('title') || 'Genje News Article';
  const description = url.searchParams.get('description') || 'Read this interesting article on Genje News';
  const imageUrl = url.searchParams.get('image') || 'https://picsum.photos/1200/630';
  
  // Return the preview data
  return json({
    title,
    description,
    imageUrl,
    url: `${url.origin}/article/${articleId}`
  });
}