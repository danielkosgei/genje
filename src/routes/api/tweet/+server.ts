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

// Track last tweet time
let lastPostedAt = 0;
const MIN_POST_INTERVAL = 60 * 60 * 1000; // 1 hour in ms

// Clear the cache every hour
setInterval(() => {
  recentlyPosted.clear();
}, 60 * 60 * 1000);

// Generate hashtags from category and source
function generateHashtags(article: any): string {
  const hashtags = ['#Kenya'];

  if (article.category) {
    switch (article.category.toLowerCase()) {
      case 'politics': hashtags.push('#KenyaPolitics'); break;
      case 'sports': hashtags.push('#KenyaSports'); break;
      case 'business': hashtags.push('#KenyaBusiness'); break;
      case 'entertainment': hashtags.push('#KenyaEntertainment'); break;
      case 'health': hashtags.push('#KenyaHealth'); break;
      case 'technology': hashtags.push('#KenyaTech'); break;
      default: hashtags.push('#KenyaNews');
    }
  } else {
    hashtags.push('#KenyaNews');
  }

  if (article.source?.toLowerCase().includes('nation')) {
    hashtags.push('#DailyNation');
  } else if (article.source?.toLowerCase().includes('standard')) {
    hashtags.push('#StandardMedia');
  }

  return hashtags.join(' ');
}

export const POST: RequestHandler = async () => {
  try {
    const now = Date.now();

    // Enforce minimum time between tweets
    if (now - lastPostedAt < MIN_POST_INTERVAL) {
      console.log('Skipping tweet: cooldown in effect.');
      return json({ success: false, error: 'Cooldown in effect. Try again later.' });
    }

    console.log('Fetching trending articles...');
    const res = await fetch('https://api.genje.co.ke/v1/articles/trending?limit=2');

    if (!res.ok) {
      const errorText = await res.text();
      return json({
        success: false,
        error: `Failed to fetch articles: ${res.status} - ${errorText}`
      });
    }

    const data = await res.json();
    const articles = data.data || data;

    if (!Array.isArray(articles) || articles.length === 0) {
      return json({ success: false, error: 'No articles found' });
    }

    const availableArticles = articles.filter(
      (article) => !recentlyPosted.has(article.id) && article.title && article.url
    );

    if (availableArticles.length === 0) {
      return json({ success: false, error: 'No new articles to post' });
    }

    const article = availableArticles[0];
    console.log('Selected article:', article.id, article.title);

    const client = new TwitterApi({
      appKey: TWITTER_API_KEY,
      appSecret: TWITTER_API_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET
    });

    const hashtags = generateHashtags(article);
    const genjeUrl = `https://genje.co.ke/article/${article.id}`;

    // Construct tweet text with length constraints
    const hashtagsLength = hashtags.length + 1;
    const urlLength = 23;
    const spacing = 3;
    const maxTitleLength = 280 - hashtagsLength - urlLength - spacing;

    let title = article.title;
    if (title.length > maxTitleLength) {
      title = title.slice(0, maxTitleLength - 3) + '...';
    }

    const tweetText = `${title}\n\n${genjeUrl}\n\n${hashtags}`;

    const response = await client.v2.tweet({ text: tweetText });

    recentlyPosted.add(article.id);
    lastPostedAt = now;

    console.log('Tweet posted successfully:', response.data.id);

    return json({
      success: true,
      tweetId: response.data.id,
      tweetUrl: `https://twitter.com/user/status/${response.data.id}`,
      articleId: article.id,
      articleTitle: article.title,
      availableArticles: availableArticles.length,
      hashtags
    });

  } catch (error) {
    console.error('Tweet post failed:', error);

    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};