<!-- +page.svelte - Main News Feed -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		Rss, 
		Search, 
		Bell, 
		Settings, 
		User, 
		Menu, 
		Globe, 
		TrendingUp, 
		Star, 
		Bookmark, 
		Heart, 
		Clock, 
		ChevronRight,
		Filter,
		Grid,
		List,
		X,
		MapPin,
		Eye,
		MessageCircle,
		Share2,
		ExternalLink,
		AlertCircle,
		Loader2
	} from '@lucide/svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import EnhancedSearch from '$lib/components/EnhancedSearch.svelte';
	import EnhancedFilters from '$lib/components/EnhancedFilters.svelte';
	import StatsDashboard from '$lib/components/StatsDashboard.svelte';
	import genjeAPI, { type NewsArticle, type NewsSource, type StatsData, type TrendingTopic } from '$lib/api.js';

	interface StatItem {
		icon: any;
		label: string;
		value: number | string;
		change?: number;
		color: string;
		bgColor: string;
	}

	// State management
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let articles = $state<NewsArticle[]>([]);
	let sources = $state<NewsSource[]>([]);
	let categories = $state<string[]>([]);
	let stats = $state<StatsData | null>(null);
	let trendingTopics = $state<TrendingTopic[]>([]);
	
	// UI state
	let searchQuery = $state('');
	let selectedCategory = $state('All');
	let selectedCountry = $state('All');
	let selectedSource = $state('All');
	let sortBy = $state('publishedAt');
	let viewMode = $state<'grid' | 'list'>('grid');
	let currentPage = $state('home');
	let showTrendingTopics = $state(false);
	let showNotifications = $state(false);
	let showUserMenu = $state(false);
	let isMobileMenuOpen = $state(false);
	
	// Pagination
	let currentPageNumber = $state(1);
	let totalPages = $state(1);
	let hasMore = $state(true);
	
	// User interactions
	let savedArticles = $state<string[]>([]);
	let likedArticles = $state<string[]>([]);
	
	// Notifications (mock for now)
	let notifications = $state([
		{
			id: '1',
			title: 'Breaking News',
			message: 'Major story developing...',
			timestamp: '2 min ago',
			read: false,
			icon: 'primary'
		},
		{
			id: '2',
			title: 'New Sources Added',
			message: '5 new trusted sources available',
			timestamp: '1 hour ago',
			read: false,
			icon: 'success'
		},
		{
			id: '3',
			title: 'System Update',
			message: 'Enhanced search features now live',
			timestamp: '3 hours ago',
			read: true,
			icon: 'warning'
		}
	]);

	// Computed values
	let filteredNews = $derived(() => {
		if (!articles || articles.length === 0) {
			return [];
		}
		
		let filtered = articles;
		
		if (searchQuery && searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			filtered = filtered.filter(article => {
				if (!article) return false;
				
				const titleMatch = article.title?.toLowerCase().includes(searchLower);
				const contentMatch = article.content?.toLowerCase().includes(searchLower);
				const summaryMatch = article.summary?.toLowerCase().includes(searchLower);
				
				return titleMatch || contentMatch || summaryMatch;
			});
		}
		
		if (selectedCategory !== 'All') {
			filtered = filtered.filter(article => article && article.category === selectedCategory);
		}
		
		if (selectedCategory !== 'All') {
			filtered = filtered.filter(article => article && article.category === selectedCategory);
		}
		
		if (selectedSource !== 'All') {
			filtered = filtered.filter(article => article && article.source === selectedSource);
		}
		
		return filtered;
	});

	const sortedNews = $derived(() => {
		const sorted = [...filteredNews()];
		
		switch (sortBy) {
			case 'publishedAt':
				return sorted.sort((a, b) => 
					new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
				);
			default:
				return sorted;
		}
	});

	const filterOptions = $derived(() => {
		const validCategories = articles
			.map(a => a.category)
			.filter(category => category && category.trim() !== '');
		
		const validSources = articles
			.map(a => a.source)
			.filter(source => source && source.trim() !== '');
		
		return {
			categories: ['All', ...categories],
			countries: ['All'], // No countries in API, just use All
			sources: ['All', ...new Set(validSources)],
			sortOptions: [
				{ value: 'publishedAt', label: 'Latest' }
			]
		};
	});

	// Transform API stats data into StatItem array for the dashboard
	const statsItems = $derived(() => {
		if (!stats) return [];
		
		return [
			{
				icon: Rss,
				label: 'Total Articles',
				value: stats.total_articles || 0,
				color: 'text-primary-600',
				bgColor: 'bg-primary-500'
			},
			{
				icon: Globe,
				label: 'Active Sources',
				value: stats.total_sources || 0,
				color: 'text-success-600',
				bgColor: 'bg-success-500'
			},
			{
				icon: TrendingUp,
				label: 'Categories',
				value: stats.categories || 0,
				color: 'text-warning-600',
				bgColor: 'bg-warning-500'
			},
			{
				icon: Clock,
				label: 'Last Updated',
				value: stats.last_updated ? new Date(stats.last_updated).toLocaleDateString() : 'N/A',
				color: 'text-error-600',
				bgColor: 'bg-error-500'
			}
		];
	});

	// API functions
	async function loadInitialData() {
		try {
			isLoading = true;
			error = null;

			// Load data in parallel
			const [articlesResponse, sourcesResponse, categoriesResponse, statsResponse, trendsResponse] = await Promise.all([
				genjeAPI.getArticles({ limit: 20, page: 1 }),
				genjeAPI.getSources(),
				genjeAPI.getCategories(),
				genjeAPI.getStats(),
				genjeAPI.getTrends(6)
			]);

			if (articlesResponse.success) {
				articles = articlesResponse.data;
				totalPages = Math.ceil((articlesResponse.total || 0) / 20);
			}

			if (sourcesResponse.success) {
				sources = sourcesResponse.data;
			}

			if (categoriesResponse.success) {
				categories = categoriesResponse.data;
			}

			if (statsResponse.success) {
				stats = statsResponse.data;
			}

			if (trendsResponse.success) {
				trendingTopics = trendsResponse.data;
			}

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load news data';
			console.error('Error loading initial data:', err);
		} finally {
			isLoading = false;
		}
	}

	async function loadMoreArticles() {
		if (currentPageNumber >= totalPages) return;

		try {
			const response = await genjeAPI.getArticles({ 
				limit: 20, 
				page: currentPageNumber + 1,
				category: selectedCategory !== 'All' ? selectedCategory : undefined,
				source: selectedSource !== 'All' ? selectedSource : undefined,
				q: searchQuery || undefined
			});

			if (response.success) {
				articles = [...articles, ...response.data];
				currentPageNumber++;
				hasMore = currentPageNumber < totalPages;
			}
		} catch (err) {
			console.error('Error loading more articles:', err);
		}
	}

	async function performSearch() {
		if (!searchQuery.trim()) {
			loadInitialData();
			return;
		}

		try {
			isLoading = true;
			const response = await genjeAPI.searchArticles(searchQuery, {
				limit: 20,
				page: 1,
				category: selectedCategory !== 'All' ? selectedCategory : undefined,
				source: selectedSource !== 'All' ? selectedSource : undefined
			});

			if (response.success) {
				articles = response.data;
				currentPageNumber = 1;
				totalPages = Math.ceil((response.total || 0) / 20);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';
		} finally {
			isLoading = false;
		}
	}

	async function refreshData() {
		try {
			await genjeAPI.refreshAll();
			await loadInitialData();
		} catch (err) {
			console.error('Error refreshing data:', err);
		}
	}

	// Event handlers
	function handleSearch(query: string) {
		searchQuery = query;
		if (query.trim()) {
			performSearch();
		} else {
			loadInitialData();
		}
	}

	function handleArticleClick(article: NewsArticle) {
		goto(`/article/${article.id}`);
	}

	function handleArticleLike(article: NewsArticle) {
		if (likedArticles.includes(article.id.toString())) {
			likedArticles = likedArticles.filter(id => id !== article.id.toString());
		} else {
			likedArticles = [...likedArticles, article.id.toString()];
		}
	}

	function handleArticleBookmark(article: NewsArticle) {
		if (savedArticles.includes(article.id.toString())) {
			savedArticles = savedArticles.filter(id => id !== article.id.toString());
		} else {
			savedArticles = [...savedArticles, article.id.toString()];
		}
	}

	function handleArticleShare(article: NewsArticle) {
		if (navigator.share) {
			navigator.share({
				title: article.title,
				text: article.summary || article.content,
				url: article.url
			});
		}
	}

	function handleTrendingTopicClick(topic: string) {
		searchQuery = topic;
		performSearch();
		showTrendingTopics = false;
	}

	function markAllNotificationsRead() {
		notifications = notifications.map(n => ({ ...n, read: true }));
	}

	function formatViews(views: number): string {
		if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
		if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
		return views.toString();
	}

	// Reactive statements for filter changes
	$effect(() => {
		if (selectedCategory !== 'All' || selectedCountry !== 'All' || selectedSource !== 'All') {
			loadInitialData();
		}
	});

	// Load data on mount
	onMount(() => {
		loadInitialData();
	});
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
							class="btn btn-sm {currentPage === 'saved' ? 'variant-filled-primary' : 'variant-ghost-surface'}"
							onclick={() => currentPage = 'saved'}
						>
							<Bookmark size={16} />
							<span class="ml-2">Saved</span>
						</button>
					</nav>
				</div>

				<!-- Enhanced Search -->
				<div class="hidden md:flex flex-1 max-w-2xl mx-8">
					<EnhancedSearch 
						value={searchQuery}
						resultsCount={filteredNews()?.length || 0}
						onSearch={handleSearch}
						onClear={() => {
							searchQuery = '';
							loadInitialData();
						}}
					/>
				</div>

				<!-- User Actions -->
				<div class="flex items-center space-x-2">
					<button 
						class="btn btn-sm variant-ghost-surface"
						onclick={refreshData}
						disabled={isLoading}
					>
						<Loader2 size={16} class={isLoading ? 'animate-spin' : 'hidden'} />
						<TrendingUp size={16} class={isLoading ? 'hidden' : ''} />
					</button>
					
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
							{#if notifications.some(n => !n.read)}
								<span class="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full animate-pulse"></span>
							{/if}
						</button>
						
						{#if showNotifications}
							<div class="absolute top-full right-0 mt-2 w-80 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
								<div class="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
									<h3 class="font-semibold">Notifications</h3>
									<button class="text-xs text-surface-500 hover:text-surface-700" onclick={markAllNotificationsRead}>Mark all read</button>
								</div>
								<div class="p-2">
									{#each notifications as notification}
										<div class="flex items-center gap-3 p-3 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors cursor-pointer {!notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}">
											<div class="w-2 h-2 rounded-full {notification.icon === 'primary' ? 'bg-primary-500' : notification.icon === 'success' ? 'bg-success-500' : notification.icon === 'warning' ? 'bg-warning-500' : 'bg-surface-500'}"></div>
											<div class="flex-1 min-w-0">
												<p class="text-sm font-medium truncate">{notification.title}</p>
												<p class="text-xs text-surface-500 truncate">{notification.message}</p>
												<p class="text-xs text-surface-400">{notification.timestamp}</p>
											</div>
											{#if !notification.read}
												<div class="w-2 h-2 bg-primary-500 rounded-full"></div>
											{/if}
										</div>
									{/each}
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
							<div class="absolute top-full right-0 mt-2 w-56 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50">
								<div class="p-3 border-b border-surface-200 dark:border-surface-700">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
											<User size={16} class="text-white" />
										</div>
										<div>
											<p class="text-sm font-medium">John Doe</p>
											<p class="text-xs text-surface-500">john.doe@example.com</p>
										</div>
									</div>
								</div>
								<div class="p-2">
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm flex items-center gap-2">
										<User size={14} />
										Profile
									</button>
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm flex items-center gap-2">
										<Bookmark size={14} />
										Saved Articles ({savedArticles.length})
									</button>
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm flex items-center gap-2">
										<Heart size={14} />
										Liked Articles ({likedArticles.length})
									</button>
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm flex items-center gap-2">
										<Settings size={14} />
										Settings
									</button>
								</div>
								<div class="p-2 border-t border-surface-200 dark:border-surface-700">
									<button class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-sm text-error-600">
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
					resultsCount={filteredNews()?.length || 0}
					onSearch={handleSearch}
					onClear={() => {
						searchQuery = '';
						loadInitialData();
					}}
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
		{#if error}
			<div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 mb-6">
				<div class="flex items-center gap-2">
					<AlertCircle size={20} class="text-error-600" />
					<div>
						<h3 class="font-semibold text-error-800 dark:text-error-200">Error Loading News</h3>
						<p class="text-sm text-error-600 dark:text-error-400">{error}</p>
					</div>
				</div>
				<button 
					class="btn btn-sm variant-filled-error mt-3"
					onclick={() => {
						error = null;
						loadInitialData();
					}}
				>
					Try Again
				</button>
			</div>
		{/if}

		{#if isLoading && articles.length === 0}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<Loader2 size={48} class="animate-spin text-primary-600 mb-4" />
					<p class="text-surface-600 dark:text-surface-400">Loading latest news...</p>
				</div>
			</div>
		{:else}
			<!-- News Aggregator Stats -->
			{#if statsItems().length > 0}
				<div class="mb-8">
					<StatsDashboard stats={statsItems()} />
				</div>
			{/if}

			<!-- Trending Topics -->
			{#if trendingTopics.length > 0}
				<div class="mb-8">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-bold flex items-center gap-2">
							<TrendingUp size={20} class="text-primary-600" />
							Trending Topics
						</h2>
						<button 
							class="text-sm text-primary-600 hover:text-primary-700"
							onclick={() => showTrendingTopics = !showTrendingTopics}
						>
							{showTrendingTopics ? 'Show Less' : 'Show More'}
						</button>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each trendingTopics.slice(0, showTrendingTopics ? 6 : 3) as topic}
							<button 
								class="card bg-surface-100 dark:bg-surface-800 p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
								onclick={() => handleTrendingTopicClick(topic.topic)}
							>
								<div class="flex items-center justify-between mb-2">
									<h3 class="font-semibold text-sm">#{topic.topic}</h3>
									<span class="text-xs text-success-600 font-medium">{topic.change}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-surface-500">{formatViews(topic.count)} mentions</span>
									<div class="w-16 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
										<div class="h-full bg-primary-500 rounded-full" style="width: {Math.min((topic.count / 20000) * 100, 100)}%"></div>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}



			<!-- Regular News -->
			<section>
				<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
					<Clock size={24} class="text-primary-600" />
					Latest from All Sources
				</h2>
				
				{#if sortedNews().length > 0}
								<div class="grid grid-cols-1 {viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-1'} gap-6">
				{#each sortedNews() as article}
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
				{:else}
					<div class="text-center py-12">
						<p class="text-surface-600 dark:text-surface-400">No articles found matching your criteria.</p>
					</div>
				{/if}
			</section>

			<!-- Load More -->
			{#if hasMore && !isLoading}
				<div class="flex justify-center mt-12">
					<button 
						class="btn variant-filled-primary"
						onclick={loadMoreArticles}
					>
						Load More Stories
						<ChevronRight size={16} class="ml-2" />
					</button>
				</div>
			{/if}
		{/if}
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
						{#each categories.slice(0, 5) as category}
							<li>
								<button 
									class="hover:text-primary-600 transition-colors"
									onclick={() => {
										selectedCategory = category;
										loadInitialData();
									}}
								>
									{category}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Sources</h4>
					<ul class="space-y-2 text-sm">
						{#each sources.slice(0, 5) as source}
							<li>
								<button 
									class="flex items-center gap-2 hover:text-primary-600 transition-colors"
									onclick={() => goto(`/source/${source.id}`)}
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