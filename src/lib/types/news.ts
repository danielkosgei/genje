export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    author: string;
    publishedAt: string;
    source: string;
    url: string;
    imageUrl?: string;
    category: 'technology' | 'business' | 'sports' | 'entertainment' | 'health' | 'science' | 'general';
}
