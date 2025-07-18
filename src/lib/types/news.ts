export interface NewsArticle {
    id: number;
    title: string;
    content: string;
    author: string;
    published_at: string;
    created_at: string;
    source: string;
    url: string;
    image_url?: string;
    category: 'diaspora' | 'kiswahili' | 'news';
    summary?: string;
}

export interface ArticlesResponse {
    success: boolean;
    data: NewsArticle[];
    meta: {
        generated_at: string;
        hours: number;
        total: number;
    };
}

export interface NewsSource {
    id: number;
    name: string;
    url: string;
    feed_url: string;
    category: string;
    active: boolean;
}
