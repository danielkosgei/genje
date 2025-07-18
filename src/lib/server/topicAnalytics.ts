// Topic Analytics Service
// Analyzes news articles to determine trending topics

interface TopicData {
	count: number;
	lastSeen: Date;
	trend: 'up' | 'down' | 'stable';
	articles: string[]; // Store article IDs for reference
}

interface TrendingTopic {
	name: string;
	count: number;
	trend: 'up' | 'down' | 'stable';
	color: string;
	category?: string;
}

class TopicAnalyticsService {
	private topics: { [key: string]: TopicData } = {};
	private previousCounts: { [key: string]: number } = {};
	private lastAnalysis: Date = new Date(0);

	// Keywords and phrases to extract from articles
	private readonly keywordPatterns = [
		// Political terms
		{ pattern: /\b(william ruto|ruto|president ruto)\b/gi, topic: 'President Ruto', category: 'politics' },
		{ pattern: /\b(raila odinga|raila|baba)\b/gi, topic: 'Raila Odinga', category: 'politics' },
		{ pattern: /\b(uhuru kenyatta|uhuru)\b/gi, topic: 'Uhuru Kenyatta', category: 'politics' },
		{ pattern: /\b(parliament|mps|senators|county assembly)\b/gi, topic: 'Parliament', category: 'politics' },
		{ pattern: /\b(elections?|voting|campaigns?)\b/gi, topic: 'Elections', category: 'politics' },
		{ pattern: /\b(corruption|scandal|investigation)\b/gi, topic: 'Corruption', category: 'politics' },
		
		// Economic terms
		{ pattern: /\b(economy|economic|gdp|inflation)\b/gi, topic: 'Economy', category: 'business' },
		{ pattern: /\b(shilling|currency|exchange rate)\b/gi, topic: 'Currency', category: 'business' },
		{ pattern: /\b(budget|taxation|taxes)\b/gi, topic: 'Budget & Taxes', category: 'business' },
		{ pattern: /\b(employment|jobs|unemployment)\b/gi, topic: 'Employment', category: 'business' },
		{ pattern: /\b(business|trade|commerce|investment)\b/gi, topic: 'Business', category: 'business' },
		
		// Social issues
		{ pattern: /\b(education|schools?|universities?|students?)\b/gi, topic: 'Education', category: 'social' },
		{ pattern: /\b(health|healthcare|hospitals?|medical)\b/gi, topic: 'Healthcare', category: 'social' },
		{ pattern: /\b(housing|affordable housing|slums)\b/gi, topic: 'Housing', category: 'social' },
		{ pattern: /\b(security|crime|police|terrorism)\b/gi, topic: 'Security', category: 'social' },
		
		// Infrastructure
		{ pattern: /\b(roads?|infrastructure|construction)\b/gi, topic: 'Infrastructure', category: 'development' },
		{ pattern: /\b(water|drought|rainfall|weather)\b/gi, topic: 'Water & Weather', category: 'environment' },
		{ pattern: /\b(energy|electricity|power|solar)\b/gi, topic: 'Energy', category: 'development' },
		{ pattern: /\b(transport|matatu|boda boda|traffic)\b/gi, topic: 'Transport', category: 'development' },
		
		// Regional
		{ pattern: /\b(nairobi|capital city)\b/gi, topic: 'Nairobi', category: 'regional' },
		{ pattern: /\b(mombasa|coast|coastal)\b/gi, topic: 'Mombasa & Coast', category: 'regional' },
		{ pattern: /\b(kisumu|nyanza|lake victoria)\b/gi, topic: 'Kisumu & Nyanza', category: 'regional' },
		{ pattern: /\b(nakuru|rift valley)\b/gi, topic: 'Rift Valley', category: 'regional' },
		
		// Sports & Culture
		{ pattern: /\b(sports?|football|rugby|athletics)\b/gi, topic: 'Sports', category: 'sports' },
		{ pattern: /\b(harambee stars|kenya national team)\b/gi, topic: 'Harambee Stars', category: 'sports' },
		{ pattern: /\b(technology|tech|digital|internet)\b/gi, topic: 'Technology', category: 'tech' },
		
		// International
		{ pattern: /\b(diaspora|abroad|overseas)\b/gi, topic: 'Diaspora', category: 'international' },
		{ pattern: /\b(east africa|eac|regional)\b/gi, topic: 'East Africa', category: 'international' },
	];

	private readonly topicColors = [
		'bg-blue-500/10 text-blue-600',
		'bg-green-500/10 text-green-600',
		'bg-purple-500/10 text-purple-600',
		'bg-red-500/10 text-red-600',
		'bg-orange-500/10 text-orange-600',
		'bg-indigo-500/10 text-indigo-600',
		'bg-pink-500/10 text-pink-600',
		'bg-teal-500/10 text-teal-600',
		'bg-amber-500/10 text-amber-600',
		'bg-cyan-500/10 text-cyan-600'
	];

	analyzeArticle(article: { id: string; title: string; content: string; category: string; published_at: string }): void {
		const articleText = `${article.title} ${article.content}`.toLowerCase();
		const articleDate = new Date(article.published_at);
		
		// Only analyze recent articles (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		if (articleDate < sevenDaysAgo) return;

		// Extract topics from the article
		this.keywordPatterns.forEach(({ pattern, topic, category }) => {
			const matches = articleText.match(pattern);
			if (matches && matches.length > 0) {
				if (!this.topics[topic]) {
					this.topics[topic] = {
						count: 0,
						lastSeen: articleDate,
						trend: 'stable',
						articles: []
					};
				}

				// Only count each article once per topic
				if (!this.topics[topic].articles.includes(article.id)) {
					this.topics[topic].count++;
					this.topics[topic].articles.push(article.id);
					this.topics[topic].lastSeen = articleDate;
				}
			}
		});

		// Also analyze article categories
		if (article.category && article.category !== 'general') {
			const categoryTopic = article.category.charAt(0).toUpperCase() + article.category.slice(1);
			if (!this.topics[categoryTopic]) {
				this.topics[categoryTopic] = {
					count: 0,
					lastSeen: articleDate,
					trend: 'stable',
					articles: []
				};
			}

			if (!this.topics[categoryTopic].articles.includes(article.id)) {
				this.topics[categoryTopic].count++;
				this.topics[categoryTopic].articles.push(article.id);
				this.topics[categoryTopic].lastSeen = articleDate;
			}
		}
	}

	calculateTrends(): void {
		// Store current counts for trend calculation
		const currentCounts = { ...this.previousCounts };
		
		Object.keys(this.topics).forEach(topic => {
			const currentCount = this.topics[topic].count;
			const previousCount = currentCounts[topic] || 0;
			
			if (currentCount > previousCount * 1.2) {
				this.topics[topic].trend = 'up';
			} else if (currentCount < previousCount * 0.8) {
				this.topics[topic].trend = 'down';
			} else {
				this.topics[topic].trend = 'stable';
			}
		});

		// Update previous counts for next calculation
		this.previousCounts = Object.fromEntries(
			Object.entries(this.topics).map(([topic, data]) => [topic, data.count])
		);
	}

	getTrendingTopics(limit: number = 10): TrendingTopic[] {
		// Clean up old topics (older than 7 days)
		this.cleanupOldTopics();
		
		// Calculate trends
		this.calculateTrends();

		// Get top topics by count
		const sortedTopics = Object.entries(this.topics)
			.filter(([_, data]) => data.count >= 2) // Minimum 2 articles to be considered trending
			.sort(([, a], [, b]) => b.count - a.count)
			.slice(0, limit);

		return sortedTopics.map(([name, data], index) => ({
			name,
			count: data.count,
			trend: data.trend,
			color: this.topicColors[index % this.topicColors.length]
		}));
	}

	private cleanupOldTopics(): void {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		Object.keys(this.topics).forEach(topic => {
			if (this.topics[topic].lastSeen < sevenDaysAgo) {
				delete this.topics[topic];
			}
		});
	}

	// Method to bulk analyze articles (for initial setup or periodic updates)
	analyzeArticles(articles: Array<{ id: string; title: string; content: string; category: string; published_at: string }>): void {
		articles.forEach(article => this.analyzeArticle(article));
		this.lastAnalysis = new Date();
	}

	getAnalyticsSnapshot() {
		return {
			totalTopics: Object.keys(this.topics).length,
			lastAnalysis: this.lastAnalysis,
			topTopics: this.getTrendingTopics(5),
			totalArticlesAnalyzed: Object.values(this.topics).reduce((sum, topic) => sum + topic.articles.length, 0)
		};
	}
}

// Export a singleton instance
export const topicAnalytics = new TopicAnalyticsService();