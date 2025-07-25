// src/routes/api/tweet/+server.ts
import { TwitterApi } from 'twitter-api-v2';
import { json } from '@sveltejs/kit';
import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET
} from '$env/static/private';

export async function POST() {
  const client = new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET
  });

  try {
    const tweet = await client.v2.tweet(
      `🚀 Test tweet from Genje News at ${new Date().toISOString()}`
    );

    return json({ success: true, tweet });
  } catch (err) {
    console.error('Twitter post failed:', err);
    return json({ success: false, error: err }, { status: 500 });
  }
}
