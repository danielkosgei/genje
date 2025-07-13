<script lang="ts">
	import { 
		Heart, 
		Share2, 
		Bookmark, 
		Eye, 
		MessageCircle, 
		ExternalLink, 
		Star, 
		Clock, 
		MapPin 
	} from '@lucide/svelte';

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

	interface Props {
		article: NewsArticle;
		variant?: 'featured' | 'regular' | 'compact';
		showActions?: boolean;
		onClick?: (article: NewsArticle) => void;
		onBookmark?: (article: NewsArticle) => void;
		onShare?: (article: NewsArticle) => void;
		onLike?: (article: NewsArticle) => void;
	}

	let { article, variant = 'regular', showActions = true, onClick, onBookmark, onShare, onLike } = $props();
	
	let isLiked = $state(false);
	let isBookmarked = $state(false);
	let isLoading = $state(false);

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

	async function handleLike(e: Event) {
		e.stopPropagation();
		isLoading = true;
		isLiked = !isLiked;
		onLike?.(article);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 300));
		isLoading = false;
	}

	async function handleBookmark(e: Event) {
		e.stopPropagation();
		isLoading = true;
		isBookmarked = !isBookmarked;
		onBookmark?.(article);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 300));
		isLoading = false;
	}

	async function handleShare(e: Event) {
		e.stopPropagation();
		isLoading = true;
		onShare?.(article);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 300));
		isLoading = false;
	}

	function handleClick() {
		onClick?.(article);
	}

	function handleExternalLink(e: Event) {
		e.stopPropagation();
		window.open(article.url, '_blank');
	}
</script>

<article 
	class="card card-hover bg-surface-100 dark:bg-surface-800 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] {variant === 'list' ? 'flex' : ''}"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="relative {variant === 'list' ? 'w-48 flex-shrink-0' : ''}">
		<img 
			src={article.urlToImage} 
			alt={article.title}
			class="w-full {variant === 'list' ? 'h-32' : variant === 'featured' ? 'h-64' : 'h-48'} object-cover transition-transform duration-300 hover:scale-105"
			loading="lazy"
		/>
		<div class="absolute top-3 left-3 flex gap-2">
			<span class="badge variant-filled-primary text-xs font-medium">
				{article.category}
			</span>
			{#if variant === 'featured'}
				<span class="badge variant-filled-warning text-xs">
					Featured
				</span>
			{/if}
			<span class="text-xs {getSentimentColor(article.sentiment)} bg-surface-900/80 backdrop-blur-sm rounded px-2 py-1 capitalize font-medium">
				{article.sentiment}
			</span>
		</div>
		{#if variant === 'featured'}
			<div class="absolute top-4 right-4">
				<div class="flex items-center gap-2 bg-surface-900/80 backdrop-blur-sm rounded-full px-3 py-1">
					<img src={article.source.logo} alt={article.source.name} class="w-4 h-4 rounded-full" />
					<span class="text-white text-xs font-medium">{article.source.name}</span>
					{#if article.source.isVerified}
						<Star size={12} class="text-warning-400" />
					{/if}
				</div>
			</div>
		{/if}
	</div>
	
	<div class="p-5 flex-1">
		{#if variant !== 'featured'}
			<div class="flex items-center gap-2 mb-3">
				<button 
					class="flex items-center gap-2 hover:text-primary-600 transition-colors"
					onclick={(e) => { e.stopPropagation(); }}
				>
					<img src={article.source.logo} alt={article.source.name} class="w-4 h-4 rounded-full" />
					<span class="text-sm font-medium">{article.source.name}</span>
					{#if article.source.isVerified}
						<Star size={12} class="text-warning-400" />
					{/if}
				</button>
				<span class="text-xs {getTrustScoreColor(article.source.trustScore)} font-medium">
					{article.source.trustScore}%
				</span>
			</div>
		{/if}
		
		<h3 class="text-lg font-bold mb-2 line-clamp-2">
			{article.title}
		</h3>
		<p class="text-surface-600 dark:text-surface-400 mb-3 line-clamp-2 text-sm">
			{article.description}
		</p>
		
		<div class="flex flex-wrap gap-1 mb-3">
			{#each article.tags.slice(0, 2) as tag}
				<span class="badge variant-ghost-surface text-xs">#{tag}</span>
			{/each}
		</div>
		
		<div class="flex items-center justify-between text-xs text-surface-500 mb-3">
			<div class="flex items-center space-x-3">
				<span class="flex items-center gap-1">
					<Clock size={12} />
					{formatDate(article.publishedAt)}
				</span>
				<span class="flex items-center gap-1">
					<MapPin size={12} />
					{article.country}
				</span>
				<span>{article.readTime}</span>
			</div>
			<button 
				class="btn btn-sm variant-ghost-surface text-xs"
				onclick={handleExternalLink}
			>
				<ExternalLink size={12} />
				<span class="ml-1">Original</span>
			</button>
		</div>
		
		<div class="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
			<div class="flex items-center space-x-3 text-xs text-surface-500">
				<span class="flex items-center gap-1">
					<Eye size={12} />
					{formatViews(article.views)}
				</span>
				<span class="flex items-center gap-1">
					<Heart size={12} class={isLiked ? 'text-error-500 fill-current' : ''} />
					{article.likes}
				</span>
				<span class="flex items-center gap-1">
					<MessageCircle size={12} />
					{article.comments}
				</span>
			</div>
			{#if showActions}
				<div class="flex items-center space-x-1">
					<button 
						class="btn btn-sm variant-ghost-surface p-2 {isBookmarked ? 'text-warning-500' : ''}" 
						onclick={handleBookmark}
						disabled={isLoading}
					>
						<Bookmark size={14} class={isBookmarked ? 'fill-current' : ''} />
					</button>
					<button 
						class="btn btn-sm variant-ghost-surface p-2" 
						onclick={handleShare}
						disabled={isLoading}
					>
						<Share2 size={14} />
					</button>
					<button 
						class="btn btn-sm variant-ghost-surface p-2" 
						onclick={handleLike}
						disabled={isLoading}
					>
						<Heart size={14} class={isLiked ? 'text-error-500 fill-current' : ''} />
					</button>
				</div>
			{/if}
		</div>
	</div>
</article> 