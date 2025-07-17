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
		views?: number;
		likes?: number;
		comments?: number;
		featured?: boolean;
		sentiment?: 'positive' | 'negative' | 'neutral';
		tags?: string[];
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
	
	// Extract an engaging snippet from the content
	function getEngagingSnippet(article: NewsArticle): string {
		// If there's no content, fall back to summary
		if (!article.content) return article.summary || 'No description available';
		
		// Remove HTML tags to get plain text
		const plainText = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		
		// Find an interesting sentence that's not too short
		const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 30);
		
		// If we have interesting sentences, use the first one
		if (sentences.length > 0) {
			// Get the first interesting sentence and add ellipsis
			return sentences[0].trim() + '...';
		}
		
		// If no good sentences, take the first 120 characters
		if (plainText.length > 120) {
			return plainText.substring(0, 120).trim() + '...';
		}
		
		// Fall back to the plain text or summary
		return plainText || article.summary || 'No description available';
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
			src={article.image_url || '/favicon.svg'} 
			alt={article.title || 'Article image'}
			class="w-full {variant === 'list' ? 'h-32' : variant === 'featured' ? 'h-64' : 'h-48'} object-cover transition-transform duration-300 hover:scale-105"
			loading="lazy"
		/>
		{#if variant === 'featured'}
			<div class="absolute top-4 right-4">
				<div class="flex items-center gap-2 bg-surface-900/80 backdrop-blur-sm rounded-full px-3 py-1">
					<span class="text-white text-xs font-medium">{article.source || 'Unknown Source'}</span>
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
					<span class="text-sm font-medium">{article.source || 'Unknown Source'}</span>
				</button>
			</div>
		{/if}
		
		<!-- Badges Section -->
		<div class="flex flex-wrap gap-2 mb-3">
			<span class="badge variant-filled-primary text-xs font-medium">
				{article.category || 'General'}
			</span>
			{#if variant === 'featured'}
				<span class="badge variant-filled-warning text-xs">
					Featured
				</span>
			{/if}
			<span class="badge variant-ghost-surface text-xs capitalize font-medium {getSentimentColor(article.sentiment || 'neutral')}">
				{article.sentiment || 'neutral'}
			</span>
		</div>
		
		<h3 class="text-lg font-bold mb-2 line-clamp-2">
			{article.title || 'Untitled'}
		</h3>
		<p class="text-surface-600 dark:text-surface-400 mb-3 line-clamp-3 text-sm">
			{getEngagingSnippet(article)}
		</p>
		
		<div class="flex flex-wrap gap-1 mb-3">
			{#if article.author}
				<span class="badge variant-ghost-surface text-xs">By {article.author}</span>
			{/if}
			{#each (article.tags || []).slice(0, 2) as tag}
				<span class="badge variant-ghost-surface text-xs">#{tag}</span>
			{/each}
		</div>
		
		<div class="flex items-center justify-between text-xs text-surface-500 mb-3">
			<div class="flex items-center space-x-3">
				<span class="flex items-center gap-1">
					<Clock size={12} />
					{formatDate(article.published_at || new Date().toISOString())}
				</span>
				<span class="flex items-center gap-1">
					<MapPin size={12} />
					{article.category || 'General'}
				</span>
				<span>1 min read</span>
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
					{formatViews(article.views || 0)}
				</span>
				<span class="flex items-center gap-1">
					<Heart size={12} class={isLiked ? 'text-error-500 fill-current' : ''} />
					{article.likes || 0}
				</span>
				<span class="flex items-center gap-1">
					<MessageCircle size={12} />
					{article.comments || 0}
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