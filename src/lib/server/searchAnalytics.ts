// Search Analytics Service
// In a production environment, this would be replaced with a proper database or Redis

interface SearchData {
	count: number;
	lastSearched: Date;
}

class SearchAnalyticsService {
	private analytics: { [key: string]: SearchData } = {};

	trackSearch(query: string, timestamp: Date = new Date()): boolean {
		// Normalize the query (lowercase, trim)
		const normalizedQuery = query.toLowerCase().trim();
		
		// Skip very short queries or common words
		if (normalizedQuery.length < 2 || 
			['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(normalizedQuery)) {
			return false;
		}

		// Update search analytics
		if (this.analytics[normalizedQuery]) {
			this.analytics[normalizedQuery].count++;
			this.analytics[normalizedQuery].lastSearched = timestamp;
		} else {
			this.analytics[normalizedQuery] = {
				count: 1,
				lastSearched: timestamp
			};
		}

		// Clean up old entries periodically
		this.cleanupOldEntries();
		return true;
	}

	getPopularSearches(limit: number = 10, daysBack: number = 30): string[] {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysBack);

		// Filter and sort searches by popularity
		return Object.entries(this.analytics)
			.filter(([_, data]) => data.lastSearched >= cutoffDate)
			.sort(([, a], [, b]) => b.count - a.count)
			.slice(0, limit)
			.map(([query]) => query);
	}

	getTotalSearches(): number {
		return Object.keys(this.analytics).length;
	}

	private cleanupOldEntries(): void {
		// Clean up entries older than 90 days to prevent memory bloat
		const ninetyDaysAgo = new Date();
		ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
		
		Object.keys(this.analytics).forEach(key => {
			if (this.analytics[key].lastSearched < ninetyDaysAgo) {
				delete this.analytics[key];
			}
		});
	}

	// Method to get analytics data for debugging/admin purposes
	getAnalyticsSnapshot() {
		return {
			totalQueries: Object.keys(this.analytics).length,
			topSearches: this.getPopularSearches(20),
			oldestEntry: Math.min(...Object.values(this.analytics).map(d => d.lastSearched.getTime())),
			newestEntry: Math.max(...Object.values(this.analytics).map(d => d.lastSearched.getTime()))
		};
	}
}

// Export a singleton instance
export const searchAnalytics = new SearchAnalyticsService();