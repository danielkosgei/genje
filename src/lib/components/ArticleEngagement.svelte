<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	interface EngagementProps {
		articleId: string;
		user?: { id: string; username: string } | null;
		initialLikes?: number;
		initialBookmarked?: boolean;
		initialUserLiked?: boolean;
		showComments?: boolean;
		compact?: boolean;
	}

	let {
		articleId,
		user = null,
		initialLikes = 0,
		initialBookmarked = false,
		initialUserLiked = false,
		showComments = true,
		compact = false
	}: EngagementProps = $props();

	let likes = $state(initialLikes);
	let isBookmarked = $state(initialBookmarked);
	let userLiked = $state(initialUserLiked);
	let showShareMenu = $state(false);
	let showCommentForm = $state(false);
	let commentText = $state('');
	let isSubmittingComment = $state(false);
	let comments = $state<Array<{
		id: string;
		text: string;
		author: string;
		timestamp: string;
	}>>([
		// Mock comments for demonstration
		{
			id: '1',
			text: 'This is a very insightful article. Thanks for sharing!',
			author: 'NewsReader',
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
		},
		{
			id: '2',
			text: 'Great coverage of this important topic.',
			author: 'InfoSeeker',
			timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
		}
	]);

	async function handleLike() {
		if (!user) {
			// Redirect to login or show login modal
			window.location.href = '/auth/login';
			return;
		}

		if (userLiked) {
			// Remove like
			likes--;
			userLiked = false;
		} else {
			// Add like
			likes++;
			userLiked = true;
		}

		// TODO: Send to API
		console.log('Like action:', { articleId, liked: userLiked });
	}

	async function handleBookmark() {
		if (!user) {
			window.location.href = '/auth/login';
			return;
		}

		isBookmarked = !isBookmarked;
		
		// TODO: Send to API
		console.log('Bookmark action:', { articleId, bookmarked: isBookmarked });
	}

	function handleShare(platform: string) {
		const url = `${window.location.origin}/article/${articleId}`;
		const title = 'Check out this article on Genje News';
		
		let shareUrl = '';
		
		switch (platform) {
			case 'twitter':
				shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
				break;
			case 'facebook':
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
				break;
			case 'whatsapp':
				shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
				break;
			case 'copy':
				navigator.clipboard.writeText(url);
				showShareMenu = false;
				return;
		}
		
		if (shareUrl) {
			window.open(shareUrl, '_blank', 'width=600,height=400');
		}
		showShareMenu = false;
	}

	async function submitComment() {
		if (!user || !commentText.trim()) return;

		isSubmittingComment = true;
		
		// TODO: Send to API
		const newComment = {
			id: Date.now().toString(),
			text: commentText.trim(),
			author: user.username,
			timestamp: new Date().toISOString()
		};
		
		comments = [newComment, ...comments];
		commentText = '';
		showCommentForm = false;
		isSubmittingComment = false;
		
		console.log('Comment submitted:', { articleId, comment: newComment });
	}

	function formatCommentTime(timestamp: string) {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return date.toLocaleDateString();
	}

	// No need for handleClickOutside since we handle it in the modal overlay
</script>

<div class="engagement-container" class:compact>
	<!-- Main engagement actions -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-1">
			<!-- Like button (Heart) -->
			<Button
				variant="ghost"
				size={compact ? "sm" : "default"}
				class="engagement-btn like-btn {userLiked ? 'active' : ''}"
				onclick={handleLike}
			>
				<svg class="w-4 h-4" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
				{#if likes > 0}
					<span class="text-xs ml-1">{likes}</span>
				{/if}
			</Button>

			<!-- Comments indicator/button -->
			{#if showComments}
				<Button
					variant="ghost"
					size={compact ? "sm" : "default"}
					class="engagement-btn"
					onclick={() => {
						if (compact) {
							// Navigate to article page with comments section
							window.location.href = `/article/${articleId}#comments`;
						} else {
							showCommentForm = !showCommentForm;
						}
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					{#if comments.length > 0}
						<span class="text-xs ml-1">{comments.length}</span>
					{/if}
					{#if !compact}
						<span class="text-xs ml-1">Comment</span>
					{/if}
				</Button>
			{/if}
		</div>

		<div class="flex items-center gap-1">
			<!-- Bookmark button -->
			<Button
				variant="ghost"
				size={compact ? "sm" : "default"}
				class="engagement-btn bookmark-btn {isBookmarked ? 'active' : ''}"
				onclick={handleBookmark}
			>
				<svg class="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
				</svg>
			</Button>

			<!-- Share button -->
			<Button
				variant="ghost"
				size={compact ? "sm" : "default"}
				class="engagement-btn {showShareMenu ? 'bg-primary/20' : ''}"
				onclick={() => {
					console.log('Share button clicked, current state:', showShareMenu);
					showShareMenu = !showShareMenu;
					console.log('Share button clicked, new state:', showShareMenu);
				}}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
				</svg>
				{#if showShareMenu}
					<span class="text-xs ml-1">OPEN</span>
				{/if}
			</Button>
		</div>
	</div>

	<!-- Share menu modal overlay -->
	{#if showShareMenu}
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onclick={() => showShareMenu = false}>
			<div class="bg-card border rounded-xl shadow-xl p-6 w-full max-w-sm" onclick={(e) => e.stopPropagation()}>
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-foreground">Share Article</h3>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => showShareMenu = false}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</Button>
				</div>
				
				<div class="space-y-2">
					<button
						class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
						onclick={() => handleShare('twitter')}
					>
						<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
							<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
						</svg>
						<span class="font-medium">Share on Twitter</span>
					</button>
					
					<button
						class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
						onclick={() => handleShare('facebook')}
					>
						<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
						<span class="font-medium">Share on Facebook</span>
					</button>
					
					<button
						class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
						onclick={() => handleShare('whatsapp')}
					>
						<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
						</svg>
						<span class="font-medium">Share on WhatsApp</span>
					</button>
					
					<button
						class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
						onclick={() => handleShare('copy')}
					>
						<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						<span class="font-medium">Copy Link</span>
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Comment form (only for non-compact mode) -->
	{#if !compact && showCommentForm}
		{#if user}
			<div class="mt-4 p-4 bg-muted/30 rounded-lg">
				<div class="flex gap-3">
					<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
						{user.username.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<textarea
							bind:value={commentText}
							placeholder="Share your thoughts..."
							class="w-full p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
							rows="3"
						></textarea>
						<div class="flex justify-end gap-2 mt-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => {
									showCommentForm = false;
									commentText = '';
								}}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								onclick={submitComment}
								disabled={!commentText.trim() || isSubmittingComment}
							>
								{#if isSubmittingComment}
									<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
								{/if}
								Post Comment
							</Button>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="mt-4 p-4 bg-muted/30 rounded-lg text-center">
				<p class="text-sm text-muted-foreground mb-3">Sign in to join the conversation</p>
				<Button size="sm" href="/auth/login">Sign In</Button>
			</div>
		{/if}
	{/if}

	<!-- Comments list (only shown in full mode, not compact) -->
	{#if !compact && showComments && comments.length > 0}
		<div class="mt-4 space-y-3">
			<h4 class="text-sm font-medium text-foreground">Comments ({comments.length})</h4>
			
			{#each comments as comment (comment.id)}
				<div class="flex gap-3 p-3 bg-muted/20 rounded-lg">
					<div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-medium">
						{comment.author.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-1">
							<span class="text-sm font-medium text-foreground">{comment.author}</span>
							<span class="text-xs text-muted-foreground">{formatCommentTime(comment.timestamp)}</span>
						</div>
						<p class="text-sm text-foreground">{comment.text}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.engagement-container.compact {
		font-size: 0.875rem;
	}

	.engagement-btn {
		@apply transition-all duration-200;
	}

	.engagement-btn:hover {
		@apply scale-105;
	}

	.engagement-btn.active.like-btn {
		@apply text-green-600 bg-green-50;
	}

	.engagement-btn.active.dislike-btn {
		@apply text-red-600 bg-red-50;
	}

	.engagement-btn.active.bookmark-btn {
		@apply text-yellow-600 bg-yellow-50;
	}
</style>