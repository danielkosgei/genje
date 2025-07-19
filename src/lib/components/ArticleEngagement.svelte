<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { engagementAPI, type Comment } from '$lib/api/engagement';

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
	let shareButtonElement: HTMLElement | null = null;
	let dropdownPosition = $state({ top: 0, left: 0 });
	let comments = $state<Comment[]>([]);
	let isLoadingComments = $state(false);
	let isLoadingEngagement = $state(false);

	async function handleLike() {
		if (!user) {
			// Redirect to login or show login modal
			window.location.href = '/auth/login';
			return;
		}

		try {
			// Optimistic update
			const previousLiked = userLiked;
			const previousLikes = likes;
			
			if (userLiked) {
				likes--;
				userLiked = false;
			} else {
				likes++;
				userLiked = true;
			}

			// Send to API
			const response = await engagementAPI.toggleLike(articleId, previousLiked);
			
			if (response.success && response.data) {
				// Update with real data from API
				likes = response.data.likesCount || likes;
				userLiked = response.data.liked;
			}
		} catch (error) {
			console.error('Error toggling like:', error);
			// Revert optimistic update on error
			if (userLiked) {
				likes--;
				userLiked = false;
			} else {
				likes++;
				userLiked = true;
			}
		}
	}

	async function handleBookmark() {
		if (!user) {
			window.location.href = '/auth/login';
			return;
		}

		try {
			// Optimistic update
			const previousBookmarked = isBookmarked;
			isBookmarked = !isBookmarked;

			// Send to API
			const response = await engagementAPI.toggleBookmark(articleId, previousBookmarked);
			
			if (response.success && response.data) {
				// Update with real data from API
				isBookmarked = response.data.bookmarked;
			}
		} catch (error) {
			console.error('Error toggling bookmark:', error);
			// Revert optimistic update on error
			isBookmarked = !isBookmarked;
		}
	}

	function isMobileDevice() {
		return (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			(navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
		);
	}

	async function handleShare(platform?: string) {
		const url = `${window.location.origin}/article/${articleId}`;
		const title = 'Check out this article on Genje News';

		// Use native sharing on mobile devices
		if (isMobileDevice() && navigator.share) {
			try {
				await navigator.share({
					title: title,
					url: url
				});
				showShareMenu = false;
				return;
			} catch (error) {
				// Fall back to custom sharing if native sharing fails
				console.log('Native sharing failed, falling back to custom share');
			}
		}

		// Custom sharing for desktop or when native sharing isn't available
		if (!platform) return;

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

		try {
			// Send comment to API
			const response = await engagementAPI.submitComment(articleId, commentText.trim());
			
			if (response.success && response.data) {
				// Add new comment to the list
				const newComment: Comment = {
					id: response.data.id,
					text: response.data.text,
					author: {
						id: user.id,
						username: user.username
					},
					timestamp: response.data.timestamp
				};
				
				comments = [newComment, ...comments];
				commentText = '';
				showCommentForm = false;
			}
		} catch (error) {
			console.error('Error submitting comment:', error);
			// Could show an error message to user here
		} finally {
			isSubmittingComment = false;
		}
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

	// Load initial engagement data (likes, bookmarks, etc.)
	async function loadEngagementData() {
		if (!user) return;

		try {
			isLoadingEngagement = true;
			const engagement = await engagementAPI.getUserEngagement(articleId);
			
			// Update state with real data from API
			likes = engagement.likesCount;
			userLiked = engagement.liked;
			isBookmarked = engagement.bookmarked;
		} catch (error) {
			console.error('Error loading engagement data:', error);
			// Keep initial values on error
		} finally {
			isLoadingEngagement = false;
		}
	}

	// Load comments for the article
	async function loadComments() {
		if (!showComments || compact) return;

		try {
			isLoadingComments = true;
			const response = await engagementAPI.getComments(articleId, 1, 20);
			
			if (response.success && response.data) {
				comments = response.data.comments;
			}
		} catch (error) {
			console.error('Error loading comments:', error);
			// Keep empty comments array on error
		} finally {
			isLoadingComments = false;
		}
	}

	// Close share menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.share-menu-container')) {
			showShareMenu = false;
		}
	}

	onMount(() => {
		// Load initial data
		loadEngagementData();
		loadComments();

		// Add click outside listener for share menu
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="engagement-container" class:compact>
	<!-- Main engagement actions -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-1">
			<!-- Like button (Heart) -->
			<Button
				variant="ghost"
				size={compact ? 'sm' : 'default'}
				class="engagement-btn like-btn {userLiked ? 'active' : ''}"
				onclick={handleLike}
			>
				<svg
					class="h-4 w-4"
					fill={userLiked ? 'currentColor' : 'none'}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
				{#if likes > 0}
					<span class="ml-1 text-xs">{likes}</span>
				{/if}
			</Button>

			<!-- Comments indicator/button -->
			{#if showComments}
				<Button
					variant="ghost"
					size={compact ? 'sm' : 'default'}
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
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
					{#if comments.length > 0}
						<span class="ml-1 text-xs">{comments.length}</span>
					{/if}
					{#if !compact}
						<span class="ml-1 text-xs">Comment</span>
					{/if}
				</Button>
			{/if}
		</div>

		<div class="flex items-center gap-1">
			<!-- Bookmark button -->
			<Button
				variant="ghost"
				size={compact ? 'sm' : 'default'}
				class="engagement-btn bookmark-btn {isBookmarked ? 'active' : ''}"
				onclick={handleBookmark}
			>
				<svg
					class="h-4 w-4"
					fill={isBookmarked ? 'currentColor' : 'none'}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
					/>
				</svg>
			</Button>

			<!-- Share button container with relative positioning -->
			<div class="share-menu-container relative">
				<!-- Share button - Hidden on desktop when not compact (article page), always visible when compact (news cards) -->
				<Button
					variant="ghost"
					size={compact ? 'sm' : 'default'}
					class="engagement-btn {!compact ? 'sm:hidden' : ''}"
					onclick={async (event) => {
						event.stopPropagation(); // Prevent event bubbling

						// On mobile, use native sharing directly (only for actual mobile devices)
						if (isMobileDevice() && navigator.share && window.innerWidth < 768) {
							try {
								await handleShare();
								return;
							} catch (error) {
								// Fall back to custom sharing if native sharing fails
							}
						}

						// Calculate dropdown position using the event target
						const buttonElement = event.currentTarget;
						if (buttonElement && buttonElement.getBoundingClientRect) {
							const rect = buttonElement.getBoundingClientRect();
							dropdownPosition = {
								top: rect.bottom + 8,
								left: Math.max(10, rect.right - 224) // Ensure it's not off-screen
							};
						} else {
							// Fallback position
							dropdownPosition = { top: 100, left: 100 };
						}

						// Show the custom share menu
						showShareMenu = !showShareMenu;
					}}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
						/>
					</svg>
				</Button>
			</div>
		</div>
	</div>

	<!-- Share modal - Simple and reliable -->
	{#if showShareMenu}
		<div
			class="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent"
			onclick={() => (showShareMenu = false)}
		>
			<div class="bg-card w-80 rounded-lg border shadow-xl" onclick={(e) => e.stopPropagation()}>
				<div class="p-3">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-foreground text-sm font-medium">Share Article</span>
						<button
							class="text-muted-foreground hover:text-foreground rounded p-1"
							onclick={() => (showShareMenu = false)}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div class="space-y-1">
						<button
							class="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
							onclick={() => handleShare('twitter')}
						>
							<svg class="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
								/>
							</svg>
							Twitter
						</button>

						<button
							class="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
							onclick={() => handleShare('facebook')}
						>
							<svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
							Facebook
						</button>

						<button
							class="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
							onclick={() => handleShare('whatsapp')}
						>
							<svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"
								/>
							</svg>
							WhatsApp
						</button>

						<button
							class="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
							onclick={() => handleShare('copy')}
						>
							<svg
								class="text-muted-foreground h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							Copy Link
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Comment form (only for non-compact mode) -->
	{#if !compact && showCommentForm}
		{#if user}
			<div class="bg-muted/30 mt-4 rounded-lg p-4">
				<div class="flex gap-3">
					<div
						class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
					>
						{user.username.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<textarea
							bind:value={commentText}
							placeholder="Share your thoughts..."
							class="border-border bg-background focus:ring-primary/20 w-full resize-none rounded-lg border p-3 focus:ring-2 focus:outline-none"
							rows="3"
						></textarea>
						<div class="mt-2 flex justify-end gap-2">
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
									<div
										class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
									></div>
								{/if}
								Post Comment
							</Button>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="bg-muted/30 mt-4 rounded-lg p-4 text-center">
				<p class="text-muted-foreground mb-3 text-sm">Sign in to join the conversation</p>
				<Button size="sm" href="/auth/login">Sign In</Button>
			</div>
		{/if}
	{/if}

	<!-- Comments list (only shown in full mode, not compact) -->
	{#if !compact && showComments && comments.length > 0}
		<div class="mt-4 space-y-3">
			<h4 class="text-foreground text-sm font-medium">Comments ({comments.length})</h4>

			{#each comments as comment (comment.id)}
				<div class="bg-muted/20 flex gap-3 rounded-lg p-3">
					<div
						class="bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
					>
						{comment.author.username.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<div class="mb-1 flex items-center gap-2">
							<span class="text-foreground text-sm font-medium">{comment.author.username}</span>
							<span class="text-muted-foreground text-xs"
								>{formatCommentTime(comment.timestamp)}</span
							>
						</div>
						<p class="text-foreground text-sm">{comment.text}</p>
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
		@apply bg-green-50 text-green-600;
	}

	.engagement-btn.active.dislike-btn {
		@apply bg-red-50 text-red-600;
	}

	.engagement-btn.active.bookmark-btn {
		@apply bg-yellow-50 text-yellow-600;
	}
</style>
