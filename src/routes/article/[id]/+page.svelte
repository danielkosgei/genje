<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		ArrowLeft, 
		Share2, 
		Bookmark, 
		Heart, 
		Eye, 
		MessageCircle, 
		Star,
		ExternalLink,
		TrendingUp,
		Tag,
		Loader2,
		AlertCircle
	} from '@lucide/svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import genjeAPI, { type NewsArticle } from '$lib/api.js';

	// State management
	let article = $state<NewsArticle | null>(null);
	let relatedArticles = $state<NewsArticle[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let isLiked = $state(false);
	let isBookmarked = $state(false);
	let showShareMenu = $state(false);

	// Get article ID from URL params
	const articleId = $derived($page.params.id);

	// Load article data
	async function loadArticle() {
		if (!articleId) return;
		
		try {
			isLoading = true;
			error = null;

			// Load article and related articles in parallel
			const [articleResponse, relatedResponse] = await Promise.all([
				genjeAPI.getArticleById(articleId),
				genjeAPI.getArticles({ limit: 4 }) // Get some recent articles as related
			]);

			if (articleResponse.success) {
				article = articleResponse.data;
				
				// Load related articles from the same category or source
				if (article) {
					const currentArticle = article;
					const categoryResponse = await genjeAPI.getArticlesByCategory(currentArticle.category, { limit: 2 });
					if (categoryResponse.success) {
						// Filter out the current article and take first 2
						relatedArticles = categoryResponse.data.filter(a => a.id !== currentArticle.id).slice(0, 2);
					}
				}
			} else {
				error = 'Article not found';
			}

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load article';
			console.error('Error loading article:', err);
		} finally {
			isLoading = false;
		}
	}

	// Utility functions
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatViews(views: number): string {
		if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
		if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
		return views.toString();
	}

	// Event handlers
	function handleLike() {
		isLiked = !isLiked;
		// TODO: Implement API call to like article
	}

	function handleBookmark() {
		isBookmarked = !isBookmarked;
		// TODO: Implement API call to bookmark article
	}

	function handleShare() {
		if (navigator.share && article) {
			navigator.share({
				title: article.title,
				text: article.description,
				url: window.location.href
			});
		} else {
			showShareMenu = !showShareMenu;
		}
	}

	function handleBack() {
		goto('/');
	}

	function handleExternalLink() {
		if (article) {
			window.open(article.url, '_blank');
		}
	}

	function handleRelatedArticleClick(relatedArticle: NewsArticle) {
		goto(`/article/${relatedArticle.id}`);
	}

	// Load article when component mounts or article ID changes
	onMount(loadArticle);
	
	$effect(() => {
		if (articleId) {
			loadArticle();
		}
	});
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
	<!-- Article Header -->
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
				
				{#if article}
					<div class="flex items-center gap-2">
						<button 
							class="btn btn-sm variant-ghost-surface"
							onclick={handleShare}
						>
							<Share2 size={16} />
						</button>
						<button 
							class="btn btn-sm variant-ghost-surface {isBookmarked ? 'text-warning-500' : ''}"
							onclick={handleBookmark}
						>
							<Bookmark size={16} class={isBookmarked ? 'fill-current' : ''} />
						</button>
						<button 
							class="btn btn-sm variant-ghost-surface {isLiked ? 'text-error-500' : ''}"
							onclick={handleLike}
						>
							<Heart size={16} class={isLiked ? 'fill-current' : ''} />
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-4xl mx-auto">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<div class="text-center">
						<Loader2 size={48} class="animate-spin text-primary-600 mb-4" />
						<p class="text-surface-600 dark:text-surface-400">Loading article...</p>
					</div>
				</div>
			{:else if error}
				<div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-6">
					<div class="flex items-center gap-3 mb-4">
						<AlertCircle size={24} class="text-error-600" />
						<div>
							<h3 class="font-semibold text-error-800 dark:text-error-200">Error Loading Article</h3>
							<p class="text-error-600 dark:text-error-400">{error}</p>
						</div>
					</div>
					<button 
						class="btn variant-filled-error"
						onclick={loadArticle}
					>
						Try Again
					</button>
				</div>
			{:else if article}
				<!-- Article Meta -->
				<div class="mb-8">
					<div class="flex items-center gap-4 mb-4">
						<button 
							class="flex items-center gap-2 hover:text-primary-600 transition-colors"
							onclick={() => goto(`/source/${article!.source.id}`)}
						>
							<img src={article.source.logo} alt={article.source.name} class="w-6 h-6 rounded-full" />
							<span class="font-medium">{article.source.name}</span>
							{#if article.source.isVerified}
								<Star size={14} class="text-warning-400" />
							{/if}
						</button>
						<span class="text-sm text-surface-500">•</span>
						<span class="text-sm text-surface-500">{formatDate(article.publishedAt)}</span>
						<span class="text-sm text-surface-500">•</span>
						<span class="text-sm text-surface-500">{article.readTime}</span>
					</div>
					
					{#if article.author}
						<div class="flex items-center gap-2 mb-4">
							<span class="text-sm text-surface-500">By {article.author}</span>
						</div>
					{/if}
					
					<div class="flex items-center gap-4 text-sm text-surface-500 mb-6">
						<span class="flex items-center gap-1">
							<Eye size={14} />
							{formatViews(article.views)} views
						</span>
						<span class="flex items-center gap-1">
							<Heart size={14} />
							{article.likes} likes
						</span>
						<span class="flex items-center gap-1">
							<MessageCircle size={14} />
							{article.comments} comments
						</span>
					</div>
				</div>

				<!-- Article Title -->
				<h1 class="text-4xl font-bold mb-6 leading-tight">
					{article.title}
				</h1>

				<!-- Article Description -->
				<p class="text-xl text-surface-600 dark:text-surface-400 mb-8 leading-relaxed">
					{article.description}
				</p>

				<!-- Article Image -->
				{#if article.urlToImage}
					<div class="mb-8">
						<img 
							src={article.urlToImage} 
							alt={article.title}
							class="w-full h-96 object-cover rounded-lg"
						/>
					</div>
				{/if}

				<!-- Article Content -->
				<div class="prose prose-lg dark:prose-invert max-w-none mb-8">
					{@html article.content}
				</div>

				<!-- Article Tags -->
				{#if article.tags && article.tags.length > 0}
					<div class="flex items-center gap-2 mb-8">
						<Tag size={16} class="text-surface-500" />
						{#each article.tags as tag}
							<span class="badge variant-ghost-surface text-xs">#{tag}</span>
						{/each}
					</div>
				{/if}

				<!-- External Link -->
				<div class="bg-surface-100 dark:bg-surface-800 p-4 rounded-lg mb-8">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm text-surface-600 dark:text-surface-400">Read the original article on {article.source.name}</p>
						</div>
						<button 
							class="btn btn-sm variant-filled-primary"
							onclick={handleExternalLink}
						>
							<ExternalLink size={14} />
							<span class="ml-2">Read Original</span>
						</button>
					</div>
				</div>
			{:else}
				<div class="text-center py-12">
					<h1 class="text-2xl font-bold mb-4">Article Not Found</h1>
					<p class="text-surface-600 dark:text-surface-400 mb-6">The article you're looking for doesn't exist.</p>
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

	<!-- Related Articles -->
	{#if relatedArticles.length > 0}
		<div class="bg-surface-100 dark:bg-surface-800 py-12">
			<div class="container mx-auto px-4">
				<h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
					<TrendingUp size={24} class="text-primary-600" />
					Related Articles
				</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each relatedArticles as relatedArticle}
						<NewsCard 
							article={relatedArticle}
							variant="compact"
							onClick={handleRelatedArticleClick}
							onBookmark={() => {}}
							onShare={() => {}}
							onLike={() => {}}
						/>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div> 