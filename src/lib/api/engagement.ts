interface EngagementResponse {
	success: boolean;
	data?: any;
	error?: string;
}

interface Comment {
	id: string;
	text: string;
	author: {
		id: string;
		username: string;
		avatar?: string;
	};
	timestamp: string;
	likes?: number;
	replies?: Comment[];
}

interface CommentsResponse {
	success: boolean;
	data: {
		comments: Comment[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			hasMore: boolean;
		};
	};
}

class EngagementAPI {
	private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(endpoint, {
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
			...options,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage;
			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.error || errorText;
			} catch {
				errorMessage = errorText;
			}
			throw new Error(`API Error: ${response.status} ${errorMessage}`);
		}

		return response.json();
	}

	// Like/Unlike article
	async toggleLike(articleId: string, currentlyLiked: boolean): Promise<EngagementResponse> {
		const action = currentlyLiked ? 'unlike' : 'like';
		return this.fetchAPI<EngagementResponse>(`/api/articles/${articleId}/like`, {
			method: 'POST',
			body: JSON.stringify({ action })
		});
	}

	// Get like status for article
	async getLikeStatus(articleId: string): Promise<EngagementResponse> {
		return this.fetchAPI<EngagementResponse>(`/api/articles/${articleId}/like`);
	}

	// Bookmark/Unbookmark article
	async toggleBookmark(articleId: string, currentlyBookmarked: boolean): Promise<EngagementResponse> {
		const action = currentlyBookmarked ? 'unbookmark' : 'bookmark';
		return this.fetchAPI<EngagementResponse>(`/api/articles/${articleId}/bookmark`, {
			method: 'POST',
			body: JSON.stringify({ action })
		});
	}

	// Get bookmark status for article
	async getBookmarkStatus(articleId: string): Promise<EngagementResponse> {
		return this.fetchAPI<EngagementResponse>(`/api/articles/${articleId}/bookmark`);
	}

	// Get comments for article
	async getComments(articleId: string, page = 1, limit = 20): Promise<CommentsResponse> {
		return this.fetchAPI<CommentsResponse>(`/api/articles/${articleId}/comments?page=${page}&limit=${limit}`);
	}

	// Submit comment
	async submitComment(articleId: string, text: string): Promise<EngagementResponse> {
		return this.fetchAPI<EngagementResponse>(`/api/articles/${articleId}/comments`, {
			method: 'POST',
			body: JSON.stringify({ text })
		});
	}

	// Get user's engagement data for article (likes, bookmarks, etc.)
	async getUserEngagement(articleId: string): Promise<{
		liked: boolean;
		bookmarked: boolean;
		likesCount: number;
		commentsCount: number;
	}> {
		try {
			const [likeStatus, bookmarkStatus] = await Promise.all([
				this.getLikeStatus(articleId),
				this.getBookmarkStatus(articleId)
			]);

			return {
				liked: likeStatus.data?.liked || false,
				bookmarked: bookmarkStatus.data?.bookmarked || false,
				likesCount: likeStatus.data?.likesCount || 0,
				commentsCount: 0 // We'll get this from comments API separately if needed
			};
		} catch (error) {
			console.error('Error getting user engagement:', error);
			return {
				liked: false,
				bookmarked: false,
				likesCount: 0,
				commentsCount: 0
			};
		}
	}

	// Get user's bookmarked articles
	async getUserBookmarks(page = 1, limit = 20): Promise<any> {
		return this.fetchAPI(`/api/user/bookmarks?page=${page}&limit=${limit}`);
	}

	// Get user's activity
	async getUserActivity(page = 1, limit = 20, type?: string): Promise<any> {
		const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
		if (type) params.append('type', type);
		return this.fetchAPI(`/api/user/activity?${params}`);
	}
}

const engagementAPI = new EngagementAPI();

export { engagementAPI };
export type { Comment, CommentsResponse, EngagementResponse };