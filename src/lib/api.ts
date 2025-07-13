const API_BASE_URL = 'https://api.genje.co.ke/v1';

export interface NewsSource {
	id: string;
	name?: string;
	domain?: string;
	logo?: string;
	category?: string;
	trustScore?: number;
	isVerified?: boolean;
	description?: string;
	founded?: string;
	headquarters?: string;
	articlesCount?: number;
	monthlyViews?: number;
}

export interface NewsArticle {
	id: number;
	title?: string;
	content?: string;
	summary?: string;
	url?: string;
	author?: string;
	source?: string;
	published_at?: string;
	created_at?: string;
	category?: string;
	image_url?: string;
}

export interface ApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
	total?: number;
	page?: number;
	limit?: number;
}

export interface StatsData {
	total_articles: number;
	total_sources: number;
	categories: number;
	last_updated: string;
}

export interface TrendingTopic {
	topic: string;
	count: number;
	change: string;
	sentiment: 'positive' | 'negative' | 'neutral';
}

class GenjeNewsAPI {
	private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					...options?.headers,
				},
				...options,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const rawData = await response.json();
			
			// Transform the actual API response to match our interface
			if (endpoint.includes('/articles') && rawData.articles) {
				return {
					data: rawData.articles,
					success: true,
					total: rawData.pagination?.total,
					page: rawData.pagination?.page,
					limit: rawData.pagination?.limit
				};
			}
			
			// For other endpoints, return as is
			return rawData;
		} catch (error) {
			console.error(`API Error for ${endpoint}:`, error);
			throw error;
		}
	}

	// Health check
	async getHealth(): Promise<{ status: string }> {
		const response = await fetch(`${API_BASE_URL.replace('/v1', '')}/health`);
		return response.json();
	}

	// Articles endpoints
	async getArticles(params?: {
		page?: number;
		limit?: number;
		category?: string;
		source?: string;
		country?: string;
		q?: string;
	}): Promise<ApiResponse<NewsArticle[]>> {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.category) searchParams.append('category', params.category);
		if (params?.source) searchParams.append('source', params.source);
		if (params?.country) searchParams.append('country', params.country);
		if (params?.q) searchParams.append('q', params.q);

		const queryString = searchParams.toString();
		const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
		
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async getArticleById(id: string): Promise<ApiResponse<NewsArticle>> {
		return this.fetchAPI<NewsArticle>(`/articles/${id}`);
	}

	async summarizeArticle(id: string): Promise<ApiResponse<{ summary: string }>> {
		return this.fetchAPI<{ summary: string }>(`/articles/${id}/summarize`, {
			method: 'POST',
		});
	}

	async getRecentArticles(limit?: number): Promise<ApiResponse<NewsArticle[]>> {
		const endpoint = `/articles/recent${limit ? `?limit=${limit}` : ''}`;
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async getArticlesFeed(params?: {
		page?: number;
		limit?: number;
		sources?: string[];
		categories?: string[];
	}): Promise<ApiResponse<NewsArticle[]>> {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sources) {
			params.sources.forEach(source => searchParams.append('sources', source));
		}
		if (params?.categories) {
			params.categories.forEach(category => searchParams.append('categories', category));
		}

		const queryString = searchParams.toString();
		const endpoint = `/articles/feed${queryString ? `?${queryString}` : ''}`;
		
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async searchArticles(query: string, params?: {
		page?: number;
		limit?: number;
		category?: string;
		source?: string;
	}): Promise<ApiResponse<NewsArticle[]>> {
		const searchParams = new URLSearchParams({ q: query });
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.category) searchParams.append('category', params.category);
		if (params?.source) searchParams.append('source', params.source);

		const endpoint = `/articles/search?${searchParams.toString()}`;
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async getTrendingArticles(limit?: number): Promise<ApiResponse<NewsArticle[]>> {
		const endpoint = `/articles/trending${limit ? `?limit=${limit}` : ''}`;
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async getArticlesBySource(sourceId: string, params?: {
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<NewsArticle[]>> {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const queryString = searchParams.toString();
		const endpoint = `/articles/by-source/${sourceId}${queryString ? `?${queryString}` : ''}`;
		
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	async getArticlesByCategory(category: string, params?: {
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<NewsArticle[]>> {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const queryString = searchParams.toString();
		const endpoint = `/articles/by-category/${category}${queryString ? `?${queryString}` : ''}`;
		
		return this.fetchAPI<NewsArticle[]>(endpoint);
	}

	// Sources endpoints
	async getSources(): Promise<ApiResponse<NewsSource[]>> {
		return this.fetchAPI<NewsSource[]>('/sources');
	}

	async getSourceById(id: string): Promise<ApiResponse<NewsSource>> {
		return this.fetchAPI<NewsSource>(`/sources/${id}`);
	}

	async createSource(source: Omit<NewsSource, 'id'>): Promise<ApiResponse<NewsSource>> {
		return this.fetchAPI<NewsSource>('/sources', {
			method: 'POST',
			body: JSON.stringify(source),
		});
	}

	async updateSource(id: string, source: Partial<NewsSource>): Promise<ApiResponse<NewsSource>> {
		return this.fetchAPI<NewsSource>(`/sources/${id}`, {
			method: 'PUT',
			body: JSON.stringify(source),
		});
	}

	async deleteSource(id: string): Promise<ApiResponse<void>> {
		return this.fetchAPI<void>(`/sources/${id}`, {
			method: 'DELETE',
		});
	}

	async refreshSource(id: string): Promise<ApiResponse<void>> {
		return this.fetchAPI<void>(`/sources/${id}/refresh`, {
			method: 'POST',
		});
	}

	// Categories endpoint
	async getCategories(): Promise<ApiResponse<string[]>> {
		return this.fetchAPI<string[]>('/categories');
	}

	// Stats endpoints
	async getStats(): Promise<ApiResponse<StatsData>> {
		return this.fetchAPI<StatsData>('/stats');
	}

	async getSourceStats(): Promise<ApiResponse<any>> {
		return this.fetchAPI<any>('/stats/sources');
	}

	async getCategoryStats(): Promise<ApiResponse<any>> {
		return this.fetchAPI<any>('/stats/categories');
	}

	async getStatsTimeline(params?: {
		period?: 'hour' | 'day' | 'week' | 'month';
		limit?: number;
	}): Promise<ApiResponse<any>> {
		const searchParams = new URLSearchParams();
		if (params?.period) searchParams.append('period', params.period);
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const queryString = searchParams.toString();
		const endpoint = `/stats/timeline${queryString ? `?${queryString}` : ''}`;
		
		return this.fetchAPI<any>(endpoint);
	}

	// Trends endpoint
	async getTrends(limit?: number): Promise<ApiResponse<TrendingTopic[]>> {
		const endpoint = `/trends${limit ? `?limit=${limit}` : ''}`;
		return this.fetchAPI<TrendingTopic[]>(endpoint);
	}

	// Status endpoint
	async getStatus(): Promise<ApiResponse<any>> {
		return this.fetchAPI<any>('/status');
	}

	// Refresh endpoint
	async refreshAll(): Promise<ApiResponse<void>> {
		return this.fetchAPI<void>('/refresh', {
			method: 'POST',
		});
	}
}

export const genjeAPI = new GenjeNewsAPI();
export default genjeAPI; 