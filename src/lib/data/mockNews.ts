import type { NewsArticle } from '$lib/types/news';

export const mockNews: NewsArticle[] = [
    {
        id: '1',
        title: 'AI Breakthrough: New Model Shows Human-like Understanding',
        description: 'Scientists develop a new AI model that demonstrates unprecedented levels of language comprehension.',
        content: 'In a groundbreaking development, researchers have created an artificial intelligence model that shows remarkable ability to understand context and nuance in human language...',
        author: 'Dr. Sarah Chen',
        publishedAt: '2025-07-18T08:00:00Z',
        source: 'Tech Insights',
        url: 'https://example.com/ai-breakthrough',
        imageUrl: 'https://placehold.co/600x400?text=AI+News',
        category: 'technology'
    },
    {
        id: '2',
        title: 'Global Markets Rally on Economic Recovery Signs',
        description: 'Stock markets worldwide show strong gains as economic indicators point to sustained recovery.',
        content: 'Global financial markets experienced significant gains today as new economic data suggests a robust recovery across major economies...',
        author: 'Michael Roberts',
        publishedAt: '2025-07-18T07:30:00Z',
        source: 'Financial Times',
        url: 'https://example.com/markets-rally',
        imageUrl: 'https://placehold.co/600x400?text=Finance+News',
        category: 'business'
    },
    {
        id: '3',
        title: 'New Renewable Energy Project Sets World Record',
        description: 'The world\'s largest solar farm begins operations, powering millions of homes.',
        content: 'A massive solar energy project has commenced operations, marking a significant milestone in renewable energy adoption...',
        author: 'Emma Green',
        publishedAt: '2025-07-17T23:15:00Z',
        source: 'Climate Chronicle',
        url: 'https://example.com/solar-project',
        imageUrl: 'https://placehold.co/600x400?text=Energy+News',
        category: 'science'
    }
];
