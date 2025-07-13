<!-- +page.svelte - Main News Feed -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { 
		Search, 
		Menu, 
		Bell, 
		User, 
		TrendingUp, 
		Clock, 
		Globe, 
		Filter,
		ChevronRight,
		Heart,
		Share2,
		Bookmark,
		Eye,
		MessageCircle,
		ExternalLink,
		Rss,
		Star,
		Zap,
		Calendar,
		MapPin,
		Settings,
		Plus,
		Minus
	} from '@lucide/svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import EnhancedSearch from '$lib/components/EnhancedSearch.svelte';
	import StatsDashboard from '$lib/components/StatsDashboard.svelte';
	import EnhancedFilters from '$lib/components/EnhancedFilters.svelte';

	interface NewsSource {
		id: string;
		name: string;
		domain: string;
		logo: string;
		category: string;
		trustScore: number;
		isVerified: boolean;
	}

	interface NewsArticle {
		id: string;
		title: string;
		description: string;
		content: string;
		url: string;
		urlToImage: string;
		publishedAt: string;
		source: NewsSource;
		category: string;
		country: string;
		language: string;
		readTime: string;
		views: number;
		likes: number;
		comments: number;
		featured: boolean;
		sentiment: 'positive' | 'negative' | 'neutral';
		tags: string[];
	}

	// Reactive state using Svelte 5 runes
	let selectedCategory = $state('All');
	let searchQuery = $state('');
	let isMobileMenuOpen = $state(false);
	let currentPage = $state('home');
	let selectedCountry = $state('All');
	let selectedSource = $state('All');
	let sortBy = $state('publishedAt');
	let viewMode = $state('grid');
	let showNotifications = $state(false);
	let showUserMenu = $state(false);

	// Mock news sources data
	const newsSources: NewsSource[] = $state([
		{ id: '1', name: 'BBC News', domain: 'bbc.com', logo: 'https://logo.clearbit.com/bbc.com', category: 'General', trustScore: 95, isVerified: true },
		{ id: '2', name: 'Reuters', domain: 'reuters.com', logo: 'https://logo.clearbit.com/reuters.com', category: 'General', trustScore: 98, isVerified: true },
		{ id: '3', name: 'TechCrunch', domain: 'techcrunch.com', logo: 'https://logo.clearbit.com/techcrunch.com', category: 'Technology', trustScore: 90, isVerified: true },
		{ id: '4', name: 'CNN', domain: 'cnn.com', logo: 'https://logo.clearbit.com/cnn.com', category: 'General', trustScore: 85, isVerified: true },
		{ id: '5', name: 'The Guardian', domain: 'theguardian.com', logo: 'https://logo.clearbit.com/theguardian.com', category: 'General', trustScore: 92, isVerified: true }
	]);

	// Mock news data with aggregator structure
	const newsArticles: NewsArticle[] = $state([
		{
			id: '1',
			title: 'Global Economic Summit Reaches Breakthrough Agreement',
			description: 'World leaders announce comprehensive trade agreements that could reshape international commerce for the next decade.',
			content: 'Full article content here...',
			url: 'https://example.com/article1',
			urlToImage: 'https://picsum.photos/600/400?random=1',
			publishedAt: '2024-07-13T10:30:00Z',
			source: newsSources[0],
			category: 'Business',
			country: 'Global',
			language: 'en',
			readTime: '5 min read',
			views: 25400,
			likes: 1234,
			comments: 189,
			featured: true,
			sentiment: 'positive',
			tags: ['economy', 'trade', 'global', 'summit']
		},
		{
			id: '2',
			title: 'Revolutionary AI Breakthrough in Medical Diagnosis',
			description: 'New artificial intelligence system shows 99% accuracy in early cancer detection, potentially saving millions of lives.',
			content: 'Full article content here...',
			url: 'https://example.com/article2',
			urlToImage: 'https://picsum.photos/600/400?random=2',
			publishedAt: '2024-07-13T09:15:00Z',
			source: newsSources[2],
			category: 'Technology',
			country: 'US',
			language: 'en',
			readTime: '7 min read',
			views: 18900,
			likes: 892,
			comments: 234,
			featured: true,
			sentiment: 'positive',
			tags: ['ai', 'medical', 'breakthrough', 'cancer']
		},
		{
			id: '3',
			title: 'Climate Change Summit Addresses Rising Sea Levels',
			description: 'International coalition announces $50 billion fund to combat rising sea levels affecting coastal cities worldwide.',
			content: 'Full article content here...',
			url: 'https://example.com/article3',
			urlToImage: 'https://picsum.photos/600/400?random=3',
			publishedAt: '2024-07-13T08:45:00Z',
			source: newsSources[1],
			category: 'Environment',
			country: 'Global',
			language: 'en',
			readTime: '6 min read',
			views: 15600,
			likes: 567,
			comments: 123,
			featured: false,
			sentiment: 'neutral',
			tags: ['climate', 'environment', 'funding', 'coastal']
		},
		{
			id: '4',
			title: 'Space Exploration Mission Discovers New Exoplanet',
			description: 'NASA announces discovery of potentially habitable exoplanet just 20 light-years away from Earth.',
			content: 'Full article content here...',
			url: 'https://example.com/article4',
			urlToImage: 'https://picsum.photos/600/400?random=4',
			publishedAt: '2024-07-13T07:20:00Z',
			source: newsSources[3],
			category: 'Science',
			country: 'US',
			language: 'en',
			readTime: '4 min read',
			views: 22100,
			likes: 1456,
			comments: 298,
			featured: false,
			sentiment: 'positive',
			tags: ['space', 'nasa', 'exoplanet', 'discovery']
		},
		{
			id: '5',
			title: 'Cryptocurrency Market Sees Major Regulatory Changes',
			description: 'New international regulations could significantly impact the future of digital currencies and blockchain technology.',
			content: 'Full article content here...',
			url: 'https://example.com/article5',
			urlToImage: 'https://picsum.photos/600/400?random=5',
			publishedAt: '2024-07-13T06:10:00Z',
			source: newsSources[4],
			category: 'Finance',
			country: 'Global',
			language: 'en',
			readTime: '8 min read',
			views: 12800,
			likes: 423,
			comments: 187,
			featured: false,
			sentiment: 'negative',
			tags: ['cryptocurrency', 'regulation', 'blockchain', 'finance']
		}
	]);

	const categories = ['All', 'Business', 'Technology', 'Environment', 'Science', 'Finance', 'Sports', 'Health', 'Politics'];
	const countries = ['All', 'Global', 'US', 'UK', 'EU', 'Asia', 'Africa'];
	const sources = ['All', ...newsSources.map(s => s.name)];

	// Computed values using Svelte 5 runes
	const filteredNews = $derived(() => {
		return newsArticles.filter(article => {
			const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
			const matchesCountry = selectedCountry === 'All' || article.country === selectedCountry;
			const matchesSource = selectedSource === 'All' || article.source.name === selectedSource;
			const matchesSearch = searchQuery === '' || 
				article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesCategory && matchesCountry && matchesSource && matchesSearch;
		});
	});

	const featuredNews = $derived(() => filteredNews.filter(article => article.featured));
	const regularNews = $derived(() => filteredNews.filter(article => !article.featured));

	const sortedNews = $derived(() => {
		const news = [...regularNews];
		switch (sortBy) {
			case 'publishedAt':
				return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
			case 'views':
				return news.sort((a, b) => b.views - a.views);
			case 'likes':
				return news.sort((a, b) => b.likes - a.likes);
			default:
				return news;
		}
	});

	// Stats data for dashboard
	const statsData = $derived(() => [
		{
			icon: Rss,
			label: 'Active Sources',
			value: newsSources.length,
			change: 12,
			color: 'text-primary-600',
			bgColor: 'bg-primary-500'
		},
		{
			icon: Zap,
			label: 'Articles Today',
			value: newsArticles.length,
			change: 8,
			color: 'text-success-600',
			bgColor: 'bg-success-500'
		},
		{
			icon: Globe,
			label: 'Countries',
			value: countries.length - 1,
			change: 5,
			color: 'text-warning-600',
			bgColor: 'bg-warning-500'
		},
		{
			icon: Eye,
			label: 'Total Views',
			value: newsArticles.reduce((sum, article) => sum + article.views, 0),
			change: 15,
			color: 'text-error-600',
			bgColor: 'bg-error-500'
		}
	]);

	// Filter options for enhanced filters component
	const filterOptions = $derived(() => {
		const news = filteredNews();
		return {
			categories: categories.map(cat => ({ value: cat, label: cat, count: news.filter((a: NewsArticle) => cat === 'All' || a.category === cat).length })),
			countries: countries.map(country => ({ value: country, label: country, count: news.filter((a: NewsArticle) => country === 'All' || a.country === country).length })),
			sources: sources.map(source => ({ value: source, label: source, count: news.filter((a: NewsArticle) => source === 'All' || a.source.name === source).length })),
			sortOptions: [
				{ value: 'publishedAt', label: 'Latest' },
				{ value: 'views', label: 'Most Viewed' },
				{ value: 'likes', label: 'Most Liked' }
			]
		};
	});

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
		
		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		if (diffInHours < 48) return 'Yesterday';
		return date.toLocaleDateString();
	}

	function formatViews(views: number): string {
		if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
		if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
		return views.toString();
	}

	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return 'text-success-600';
			case 'negative': return 'text-error-600';
			default: return 'text-surface-600';
		}
	}

	function getTrustScoreColor(score: number): string {
		if (score >= 95) return 'text-success-600';
		if (score >= 85) return 'text-warning-600';
		return 'text-error-600';
	}

	function navigateToArticle(article: NewsArticle): void {
		goto(`/article/${article.id}`);
	}

	function navigateToSource(source: NewsSource): void {
		goto(`/source/${source.id}`);
	}

	// Event handlers for enhanced components
	function handleSearch(query: string) {
		searchQuery = query;
	}

	function handleArticleLike(article: NewsArticle) {
		console.log('Liked article:', article.title);
		// Here you would typically make an API call
	}

	function handleArticleBookmark(article: NewsArticle) {
		console.log('Bookmarked article:', article.title);
		// Here you would typically make an API call
	}

	function handleArticleShare(article: NewsArticle) {
		console.log('Shared article:', article.title);
		// Here you would typically open share dialog
	}

	function handleArticleClick(article: NewsArticle) {
		navigateToArticle(article);
	}
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
	<!-- Enhanced Header -->
	<header class="sticky top-0 z-50 bg-surface-50/95 dark:bg-surface-900/95 backdrop-blur-sm border-b border-surface-200 dark:border-surface-700">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<!-- Logo & Navigation -->
				<div class="flex items-center space-x-6">
					<button 
						class="lg:hidden btn btn-sm variant-ghost-surface"
						onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					>
						<Menu size={20} />
					</button>
					<h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
						<Rss size={24} />
						Genje News
					</h1>
					
					<!-- Desktop Navigation -->
					<nav class="hidden lg:flex items-center space-x-6 text-sm">
						<button 
							class="btn btn-sm {currentPage === 'home' ? 'variant-filled-primary' : 'variant-ghost-surface'}"
							onclick={() => currentPage = 'home'}
						>
							<Globe size={16} />
							<span class="ml-2">Home</span>
						</button>
						<button 
							class="btn btn-sm {currentPage === 'trending' ? 'variant-filled-primary' : 'variant-ghost-surface'}"
							onclick={() => currentPage = 'trending'}
						>
							<TrendingUp size={16} />
							<span class="ml-2">Trending</span>
						</button>
						<button 
							class="btn btn-sm {currentPage === 'sources' ? 'variant-filled-primary' : 'variant-ghost-surface'}"
							onclick={() => currentPage = 'sources'}
						>
							<Star size={16} />
							<span class="ml-2">Sources</span>
						</button>
						<button 
							class="btn btn-sm {currentPage === 'saved' ? 'variant-filled-primary' : 'variant-ghost-surface'}"
							onclick={() => currentPage = 'saved'}
						>
							<Bookmark size={16} />
							<span class="ml-2">Saved</span>
						</button>
					</nav>
				</div>

				<!-- Enhanced Search -->
				<div class="hidden md:flex flex-1 max-w-lg mx-8">
					<EnhancedSearch 
						value={searchQuery}
						resultsCount={filteredNews.length}
						onSearch={handleSearch}
						onClear={() => searchQuery = ''}
					/>
				</div>

				<!-- User Actions -->
				<div class="flex items-center space-x-2">
					<button class="btn btn-sm variant-ghost-surface md:hidden">
						<Search size={20} />
					</button>
					
					<!-- Notifications -->
					<div class="relative">
						<button 
							class="btn btn-sm variant-ghost-surface relative"
							onclick={() => showNotifications = !showNotifications}
						>
							<Bell size={20} />
							<span class="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full animate-pulse"></span>
						</button>
						
						{#if showNotifications}
							<div class="absolute top-full right-0 mt-2 w-80 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50">
								<div class="p-4 border-b border-surface-200 dark:border-surface-700">
									<h3 class="font-semibold">Notifications</h3>
								</div>
								<div class="p-4">
									<div class="space-y-3">
										<div class="flex items-center gap-3 p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded">
											<div class="w-2 h-2 bg-primary-500 rounded-full"></div>
											<div class="flex-1">
												<p class="text-sm font-medium">New article from BBC News</p>
												<p class="text-xs text-surface-500">2 minutes ago</p>
											</div>
										</div>
										<div class="flex items-center gap-3 p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded">
											<div class="w-2 h-2 bg-success-500 rounded-full"></div>
											<div class="flex-1">
												<p class="text-sm font-medium">Trending topic: AI Breakthrough</p>
												<p class="text-xs text-surface-500">5 minutes ago</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
					
					<button class="btn btn-sm variant-ghost-surface">
						<Settings size={20} />
					</button>
					
					<!-- User Menu -->
					<div class="relative">
						<button 
							class="btn btn-sm variant-ghost-surface"
							onclick={() => showUserMenu = !showUserMenu}
						>
							<User size={20} />
						</button>
						
						{#if showUserMenu}
							<div class="absolute top-full right-0 mt-2 w-48 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50">
								<div class="p-2">
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm">
										Profile
									</button>
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm">
										Settings
									</button>
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm">
										Sign Out
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Mobile Search -->
			<div class="md:hidden mt-4">
				<EnhancedSearch 
					value={searchQuery}
					resultsCount={filteredNews.length}
					onSearch={handleSearch}
					onClear={() => searchQuery = ''}
				/>
			</div>
		</div>
	</header>

	<!-- Enhanced Filter Bar -->
	<EnhancedFilters 
		categories={filterOptions().categories}
		countries={filterOptions().countries}
		sources={filterOptions().sources}
		sortOptions={filterOptions().sortOptions}
		selectedCategory={selectedCategory}
		selectedCountry={selectedCountry}
		selectedSource={selectedSource}
		sortBy={sortBy}
		viewMode={viewMode}
		onCategoryChange={(category: string) => selectedCategory = category}
		onCountryChange={(country: string) => selectedCountry = country}
		onSourceChange={(source: string) => selectedSource = source}
		onSortChange={(sort: string) => sortBy = sort}
		onViewModeChange={(mode: 'grid' | 'list') => viewMode = mode}
	/>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-6">
		<!-- News Aggregator Stats -->
		<div class="mb-8">
			<StatsDashboard stats={statsData()} />
		</div>

		<!-- Featured News -->
		{#if featuredNews.length > 0}
			<section class="mb-12">
				<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
					<Star size={24} class="text-warning-600" />
					Featured Stories
				</h2>
				
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each featuredNews as article}
						<NewsCard 
							{article}
							variant="featured"
							onClick={handleArticleClick}
							onBookmark={handleArticleBookmark}
							onShare={handleArticleShare}
							onLike={handleArticleLike}
						/>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Regular News -->
		<section>
			<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
				<Clock size={24} class="text-primary-600" />
				Latest from All Sources
			</h2>
			
			<div class="grid grid-cols-1 {viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-1'} gap-6">
				{#each sortedNews as article}
					<NewsCard 
						{article}
						variant={viewMode === 'list' ? 'compact' : 'regular'}
						onClick={handleArticleClick}
						onBookmark={handleArticleBookmark}
						onShare={handleArticleShare}
						onLike={handleArticleLike}
					/>
				{/each}
			</div>
		</section>

		<!-- Load More -->
		<div class="flex justify-center mt-12">
			<button class="btn variant-filled-primary">
				Load More Stories
				<ChevronRight size={16} class="ml-2" />
			</button>
		</div>
	</main>

	<!-- Enhanced Footer -->
	<footer class="bg-surface-100 dark:bg-surface-800 mt-16">
		<div class="container mx-auto px-4 py-12">
			<div class="grid grid-cols-1 md:grid-cols-5 gap-8">
				<div class="md:col-span-2">
					<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
						<Rss size={20} class="text-primary-600" />
						Genje News
					</h3>
					<p class="text-surface-600 dark:text-surface-400 text-sm mb-4">
						Your comprehensive news aggregator, bringing you the latest stories from trusted sources worldwide. Stay informed with real-time updates and diverse perspectives.
					</p>
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 bg-success-500 rounded-full"></div>
							<span class="text-sm text-surface-600">Live Updates</span>
						</div>
						<div class="flex items-center gap-2">
							<Star size={16} class="text-warning-500" />
							<span class="text-sm text-surface-600">Verified Sources</span>
						</div>
					</div>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Categories</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="#" class="hover:text-primary-600 transition-colors">Politics</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Technology</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Sports</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Health</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Environment</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Sources</h4>
					<ul class="space-y-2 text-sm">
						{#each newsSources.slice(0, 5) as source}
							<li>
								<button 
									class="flex items-center gap-2 hover:text-primary-600 transition-colors"
									onclick={() => navigateToSource(source)}
								>
									<img src={source.logo} alt={source.name} class="w-4 h-4 rounded-full" />
									{source.name}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Support</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="#" class="hover:text-primary-600 transition-colors">Help Center</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Contact Us</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
						<li><a href="#" class="hover:text-primary-600 transition-colors">Terms of Service</a></li>
					</ul>
				</div>
			</div>
			
			<div class="border-t border-surface-200 dark:border-surface-700 mt-8 pt-8 text-center text-sm text-surface-500">
				<p>&copy; 2024 Genje News. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>