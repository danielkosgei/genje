<script lang="ts">
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsCardSkeleton from '$lib/components/NewsCardSkeleton.svelte';
	import { onMount } from 'svelte';
	import type { NewsArticle } from '$lib/types/news';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let bookmarkedArticles = $state<NewsArticle[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let hasMore = $state(true);
	let currentPage = $state(1);
	let isLoadingMore = $state(false);

	async function loadBookmarks(append = false) {
		try {
			if (!append) {
				isLoading = true;
				bookmarkedArticles = [];
				currentPage = 1;
			} else {
				isLoadingMore = true;
				currentPage++;
			}

			const response = await fetch(`/api/user/bookmarks?page=${currentPage}&limit=20`);
			
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/auth/login';
					return;
				}
				throw new Error('Failed to load bookmarks');
			}

			const result = await response.json();
			
			if (result.success && result.data) {
				const newArticles = result.data.articles || result.data;
				
				if (append) {
					bookmarkedArticles = [...bookmarkedArticles, ...newArticles];
				} else {
					bookmarkedArticles = newArticles;
				}
				
				hasMore = newArticles.length >= 20;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load bookmarks';
		} finally {
			isLoading = false;
			isLoadingMore = false;
		}
	}

	function loadMore() {
		if (!isLoadingMore && hasMore) {
			loadBookmarks(true);
		}
	}

	// Infinite scroll
	function handleScroll() {
		if (isLoadingMore || !hasMore) return;

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		if (scrollTop + windowHeight >= documentHeight - 300) {
			loadMore();
		}
	}

	onMount(() => {
		loadBookmarks();
		window.addEventListener('scroll', handleScroll);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>My Bookmarks - Genje News</title>
	<meta name="description" content="Your saved articles on Genje News" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-4 mb-4">
				<a href="/" class="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to News
				</a>
			</div>
			
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-yellow-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
					</svg>
				</div>
				<div>
					<h1 class="text-3xl font-bold text-foreground">My Bookmarks</h1>
					<p class="text-muted-foreground">Articles you've saved for later reading</p>
				</div>
			</div>
		</div>

		<!-- Content -->
		{#if isLoading}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<NewsCardSkeleton />
				{/each}
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h2 class="text-xl font-semibold text-red-600 mb-2">Error Loading Bookmarks</h2>
				<p class="text-muted-foreground mb-4">{error}</p>
				<button 
					onclick={() => loadBookmarks()} 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Try Again
				</button>
			</div>
		{:else if bookmarkedArticles.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
					<svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-foreground mb-2">No Bookmarks Yet</h2>
				<p class="text-muted-foreground mb-4">Start bookmarking articles you want to read later</p>
				<a 
					href="/" 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Browse Articles
				</a>
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each bookmarkedArticles as article (article.id)}
					<NewsCard {article} user={data?.user} />
				{/each}
			</div>

			<!-- Load More -->
			{#if hasMore}
				<div class="flex justify-center mt-8">
					{#if isLoadingMore}
						<div class="flex items-center gap-2 text-muted-foreground">
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							Loading more bookmarks...
						</div>
					{:else}
						<button 
							onclick={loadMore}
							class="px-6 py-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
						>
							Load More Bookmarks
						</button>
					{/if}
				</div>
			{:else if bookmarkedArticles.length > 0}
				<div class="text-center mt-8 py-4 text-muted-foreground">
					You've reached the end of your bookmarks
				</div>
			{/if}
		{/if}
	</div>
</div>