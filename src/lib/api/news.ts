import type { NewsArticle, ArticlesResponse, NewsSource } from '$lib/types/news';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_BASE_URL || 'https://api.genje.co.ke';

class NewsAPI {
	private async fetchAPI<T>(endpoint: string): Promise<T> {
		const response = await fetch(`${API_BASE_URL}${endpoint}`);

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async getArticles(page = 1, limit = 20): Promise<ArticlesResponse> {
		return this.fetchAPI<ArticlesResponse>(`/v1/articles?page=${page}&limit=${limit}`);
	}

	async getRecentArticles(limit = 20): Promise<ArticlesResponse> {
		return this.fetchAPI<ArticlesResponse>(`/v1/articles/recent?limit=${limit}`);
	}

	async getFeedArticles(limit = 20): Promise<ArticlesResponse> {
		return this.fetchAPI<ArticlesResponse>(`/v1/articles/feed?limit=${limit}`);
	}

	async getTrendingArticles(limit = 20): Promise<ArticlesResponse> {
		return this.fetchAPI<ArticlesResponse>(`/v1/articles/trending?limit=${limit}`);
	}

	async searchArticles(query: string, limit = 20): Promise<ArticlesResponse> {
		const encodedQuery = encodeURIComponent(query);
		return this.fetchAPI<ArticlesResponse>(`/v1/articles/search?q=${encodedQuery}&limit=${limit}`);
	}

	async getArticlesByCategory(category: string, limit = 20): Promise<ArticlesResponse> {
		return this.fetchAPI<ArticlesResponse>(`/v1/articles/by-category/${category}?limit=${limit}`);
	}

	async getArticleById(id: number): Promise<NewsArticle> {
		return this.fetchAPI<NewsArticle>(`/v1/articles/${id}`);
	}

	async summarizeArticle(id: number): Promise<{ summary: string }> {
		const response = await fetch(`${API_BASE_URL}/v1/articles/${id}/summarize`, {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async getSources(): Promise<NewsSource[]> {
		return this.fetchAPI<NewsSource[]>('/v1/sources');
	}

	async getCategories(): Promise<string[]> {
		return this.fetchAPI<string[]>('/v1/categories');
	}
}

export const newsAPI = new NewsAPI();