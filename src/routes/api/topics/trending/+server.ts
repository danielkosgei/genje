import { json } from '@sveltejs/kit';
import { TwitterApi } from 'twitter-api-v2';
import { 
  TWITTER_ACCESS_TOKEN, 
  TWITTER_API_KEY, 
  TWITTER_API_SECRET, 
  TWITTER_ACCESS_SECRET 
} from '$env/static/private';
import type { RequestHandler } from './$types';

// Store recently posted article IDs to avoid duplicates
let recentlyPosted: Set<number> = new Set();

// Clear the cache every hour
setInterval(() => {
  recentlyPosted.clear();
}, 60 * 60 * 1000);

function generateHashtags(article: any): string {
  const hashtags = ['#Kenya'];
  
  // Add category-based hashtags
  if (article.category) {
    switch (article.category.toLowerCase()) {
      case 'politics':
        hashtags.push('#KenyaPolitics');
        break;
      case 'sports':
        hashtags.push('#KenyaSports');
        break;
      case 'business':
        hashtags.push('#KenyaBusiness');
        break;
      case 'entertainment':
        hashtags.push('#KenyaEntertainment');
        break;
      case 'health':
        hashtags.push('#KenyaHealth');
        break;
      case 'technology':
        hashtags.push('#KenyaTech');
        break;
      default:
        hashtags.push('#KenyaNews');
    }
  } else {
    hashtags.push('#KenyaNews');
  }
  
  // Add source-based hashtag if it's a major source
  if (article.source && article.source.toLowerCase().includes('nation')) {
    hashtags.push('#DailyNation');
  } else if (article.source && article.source.toLowerCase().includes('standard')) {
    hashtags.push('#StandardMedia');
  }
  
  return hashtags.join(' ');
}

async function uploadImageToTwitter(client: TwitterApi, imageUrl: string): Promise<string | null> {
  try {
    console.log('Attempting to upload image:', imageUrl);
    
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log('Failed to fetch image:', imageResponse.status);
      return null;
    }
    
    // Get the image as buffer
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Determine mime type from URL or response headers
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Upload to Twitter
    const mediaId = await client.v1.uploadMedia(imageBuffer, { 
      mimeType: contentType,
      target: 'tweet'
    });
    
    console.log('Image uploaded successfully:', mediaId);
    return mediaId;
  } catch (error) {
    console.error('Failed to upload image:', error);
    return null;
  }
}

export const POST: RequestHandler = async () => {
  try {
    // Fetch trending articles
    console.log('Fetching trending articles from API...');
    const res = await fetch('https://api.genje.co.ke/v1/articles/trending');
    
    console.log('API Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log('API Error response:', errorText);
      return json({ 
        success: false, 
        error: `Failed to fetch articles: ${res.status} - ${errorText}` 
      });
    }

    const data = await res.json();
    const articles = data.data || data;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return json({ 
        success: false, 
        error: 'No articles found in trending feed' 
      });
    }

    // Filter out recently posted articles
    const availableArticles = articles.filter(article => 
      !recentlyPosted.has(article.id) && article.title && article.url
    );

    if (availableArticles.length === 0) {
      return json({ 
        success: false, 
        error: 'No new articles to post (all recently posted or invalid)' 
      });
    }

    // Get the first available article
    const article = availableArticles[0];
    console.log('Selected article:', { id: article.id, title: article.title });

    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: TWITTER_API_KEY,
      appSecret: TWITTER_API_SECRET,  
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET
    });

    // Generate hashtags
    const hashtags = generateHashtags(article);
    
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .substring(0, 50);           // Limit length
}

// Later in the POST function, replace the genjeUrl line:
    // Use original source URL since IDs don't match
    const genjeUrl = article.url;
    
    // Construct tweet content
    const hashtagsLength = hashtags.length + 1; // +1 for space
    const urlLength = 23; // Twitter's t.co URL length
    const spacing = 3; // newlines and spaces
    const maxTitleLength = 280 - hashtagsLength - urlLength - spacing;
    
    let title = article.title;
    if (title.length > maxTitleLength) {
      title = title.substring(0, maxTitleLength - 3) + '...';
    }
    
    const tweetText = `${title}\n\n${genjeUrl}\n\n${hashtags}`;
    
    console.log('Tweet content:', { 
      text: tweetText, 
      length: tweetText.length 
    });

    // Try to upload image if available
    let mediaId = null;
    if (article.image_url) {
      mediaId = await uploadImageToTwitter(client, article.image_url);
    }

    // Post the tweet
    const tweetOptions: any = { text: tweetText };
    if (mediaId) {
      tweetOptions.media = { media_ids: [mediaId] };
    }

    const response = await client.v2.tweet(tweetOptions);

    // Mark this article as recently posted
    recentlyPosted.add(article.id);

    console.log('Tweet posted successfully:', {
      tweetId: response.data.id,
      articleId: article.id,
      articleTitle: article.title,
      tweetLength: tweetText.length,
      hasImage: !!mediaId
    });

    return json({ 
      success: true, 
      tweetId: response.data.id,
      tweetUrl: `https://twitter.com/user/status/${response.data.id}`,
      articleId: article.id,
      articleTitle: article.title,
      hasImage: !!mediaId,
      availableArticles: availableArticles.length,
      hashtags
    });

  } catch (error) {
    console.error('Twitter post failed:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        return json({ 
          success: false, 
          error: 'Duplicate tweet detected. Try again for next article.',
          canRetry: true
        });
      }
      if (error.message.includes('rate limit')) {
        return json({ 
          success: false, 
          error: 'Twitter rate limit exceeded. Try again later.' 
        });
      }
    }

    return json({ 
      success: false, 
      error: 'Failed to post tweet. Check console for details.' 
    });
  }
};