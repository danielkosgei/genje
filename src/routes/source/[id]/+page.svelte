<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		ArrowLeft, 
		Star, 
		Globe, 
		TrendingUp, 
		Clock, 
		Eye,
		Filter,
		Grid,
		List,
		Loader2,
		AlertCircle
	} from '@lucide/svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import genjeAPI, { type NewsArticle, type NewsSource } from '$lib/api.js';

	// State management
	let source = $state<NewsSource | null>(null);
	let articles = $state<NewsArticle[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let selectedCategory = $state('All');
	let sortBy = $state('publishedAt');
	let viewMode = $state<'grid' | 'list'>('grid');
	let currentPage = $state(1);
	let hasMore = $state(true);

	// Get source ID from URL params
	const sourceId = $derived($page.params.id);

	// Computed values
	const categories = $derived(() => ['All', ...new Set(articles.map(a => a.category))]);

	const filteredArticles = $derived(() => {
		let filtered = articles;
		
		if (selectedCategory !== 'All') {
			filtered = filtered.filter(article => article.category === selectedCategory);
		}
		
		switch (sortBy) {
			case 'publishedAt':
				return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
			case 'views':
				return filtered.sort((a, b) => b.views - a.views);
			case 'likes':
				return filtered.sort((a, b) => b.likes - a.likes);
			default:
				return filtered;
		}
	});

	// Load source data
	async function loadSource() {
		if (!sourceId) return;
		
		try {
			isLoading = true;
			error = null;

			// Load source info and articles in parallel
			const [sourceResponse, articlesResponse] = await Promise.all([
				genjeAPI.getSourceById(sourceId),
				genjeAPI.getArticlesBySource(sourceId, { limit: 20, page: 1 })
			]);

			if (sourceResponse.success) {
				source = sourceResponse.data;
			} else {
				error = 'Source not found';
				return;
			}

			if (articlesResponse.success) {
				articles = articlesResponse.data;
			}

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load source data';
			console.error('Error loading source:', err);
		} finally {
			isLoading = false;
		}
	}

	async function loadMoreArticles() {
		if (!sourceId || !hasMore) return;

		try {
			const response = await genjeAPI.getArticlesBySource(sourceId, { 
				limit: 20, 
				page: currentPage + 1 
			});

			if (response.success && response.data.length > 0) {
				articles = [...articles, ...response.data];
				currentPage++;
			} else {
				hasMore = false;
			}
		} catch (err) {
			console.error('Error loading more articles:', err);
		}
	}

	// Utility functions
	function formatNumber(num: number): string {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}

	// Event handlers
	function handleBack() {
		goto('/');
	}

	function handleArticleClick(article: NewsArticle) {
		goto(`/article/${article.id}`);
	}

	function handleArticleLike(article: NewsArticle) {
		console.log('Liked article:', article.title);
	}

	function handleArticleBookmark(article: NewsArticle) {
		console.log('Bookmarked article:', article.title);
	}

	function handleArticleShare(article: NewsArticle) {
		console.log('Shared article:', article.title);
	}

	// Load data when component mounts or source ID changes
	onMount(loadSource);
	
	$effect(() => {
		if (sourceId) {
			loadSource();
		}
	});
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
	<!-- Header -->
	<div class="bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center gap-4">
				<button 
					class="btn btn-sm variant-ghost-surface"
					onclick={handleBack}
				>
					<ArrowLeft size={16} />
					<span class="ml-2">Back to News</span>
				</button>
				
				<div class="flex-1"></div>
				
				{#if source}
					<div class="flex items-center gap-2">
						<button 
							class="btn btn-sm variant-ghost-surface"
							onclick={() => window.open(`https://${source!.domain}`, '_blank')}
						>
							<Globe size={16} />
							<span class="ml-2">Visit Site</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-6xl mx-auto">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<div class="text-center">
						<Loader2 size={48} class="animate-spin text-primary-600 mb-4" />
						<p class="text-surface-600 dark:text-surface-400">Loading source...</p>
					</div>
				</div>
			{:else if error}
				<div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-6">
					<div class="flex items-center gap-3 mb-4">
						<AlertCircle size={24} class="text-error-600" />
						<div>
							<h3 class="font-semibold text-error-800 dark:text-error-200">Error Loading Source</h3>
							<p class="text-error-600 dark:text-error-400">{error}</p>
						</div>
					</div>
					<button 
						class="btn variant-filled-error"
						onclick={loadSource}
					>
						Try Again
					</button>
				</div>
			{:else if source}
				<!-- Source Header -->
				<div class="flex items-center gap-6 mb-8">
					<img src={source.logo} alt={source.name} class="w-20 h-20 rounded-lg" />
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-2">
							<h1 class="text-3xl font-bold">{source.name}</h1>
							{#if source.isVerified}
								<Star size={20} class="text-warning-500" />
							{/if}
						</div>
						{#if source.description}
							<p class="text-surface-600 dark:text-surface-400 mb-3">{source.description}</p>
						{/if}
						<div class="flex items-center gap-4 text-sm text-surface-500">
							<span>Trust Score: <span class="font-semibold text-success-600">{source.trustScore}%</span></span>
							{#if source.founded}
								<span>•</span>
								<span>Founded: {source.founded}</span>
							{/if}
							{#if source.headquarters}
								<span>•</span>
								<span>{source.headquarters}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Source Stats -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div class="card bg-surface-100 dark:bg-surface-800 p-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
								<TrendingUp size={20} class="text-white" />
							</div>
							<div>
								<p class="text-sm text-surface-600 dark:text-surface-400">Articles</p>
								<p class="text-xl font-bold">{formatNumber(articles.length)}</p>
							</div>
						</div>
					</div>
					<div class="card bg-surface-100 dark:bg-surface-800 p-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
								<Eye size={20} class="text-white" />
							</div>
							<div>
								<p class="text-sm text-surface-600 dark:text-surface-400">Total Views</p>
								<p class="text-xl font-bold">{formatNumber(articles.reduce((sum, a) => sum + a.views, 0))}</p>
							</div>
						</div>
					</div>
					<div class="card bg-surface-100 dark:bg-surface-800 p-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-warning-500 rounded-full flex items-center justify-center">
								<Clock size={20} class="text-white" />
							</div>
							<div>
								<p class="text-sm text-surface-600 dark:text-surface-400">Latest Article</p>
								<p class="text-xl font-bold">{articles.length > 0 ? 'Recent' : 'No articles'}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Filters -->
				<div class="bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4 mb-8">
					<div class="flex flex-wrap items-center justify-between gap-4">
											<div class="flex flex-wrap gap-2">
						{#each categories() as category}
							<button
								class="btn btn-sm {selectedCategory === category ? 'variant-filled-primary' : 'variant-ghost-surface'}"
								onclick={() => selectedCategory = category}
							>
								{category}
							</button>
						{/each}
					</div>

						<div class="flex items-center gap-2">
							<select bind:value={sortBy} class="select select-sm">
								<option value="publishedAt">Latest</option>
								<option value="views">Most Viewed</option>
								<option value="likes">Most Liked</option>
							</select>

							<div class="flex items-center gap-1 bg-surface-200 dark:bg-surface-700 rounded-lg p-1">
								<button 
									class="p-2 rounded transition-colors {viewMode === 'grid' ? 'bg-surface-50 dark:bg-surface-600 text-primary-600' : 'text-surface-500'}"
									onclick={() => viewMode = 'grid'}
								>
									<Grid size={16} />
								</button>
								<button 
									class="p-2 rounded transition-colors {viewMode === 'list' ? 'bg-surface-50 dark:bg-surface-600 text-primary-600' : 'text-surface-500'}"
									onclick={() => viewMode = 'list'}
								>
									<List size={16} />
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Articles -->
				<h2 class="text-2xl font-bold mb-6">Articles from {source.name}</h2>
				
				{#if filteredArticles().length > 0}
					<div class="grid grid-cols-1 {viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-1'} gap-6">
						{#each filteredArticles() as article}
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

					<!-- Load More -->
					{#if hasMore}
						<div class="flex justify-center mt-8">
							<button 
								class="btn variant-filled-primary"
								onclick={loadMoreArticles}
							>
								Load More Articles
							</button>
						</div>
					{/if}
				{:else}
					<div class="text-center py-12">
						<p class="text-surface-600 dark:text-surface-400">No articles found for the selected filters.</p>
					</div>
				{/if}
			{:else}
				<div class="text-center py-12">
					<h1 class="text-2xl font-bold mb-4">Source Not Found</h1>
					<p class="text-surface-600 dark:text-surface-400 mb-6">The news source you're looking for doesn't exist.</p>
					<button 
						class="btn variant-filled-primary"
						onclick={handleBack}
					>
						<ArrowLeft size={16} />
						<span class="ml-2">Back to News</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div> 