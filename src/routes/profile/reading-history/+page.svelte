<script lang="ts">
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsCardSkeleton from '$lib/components/NewsCardSkeleton.svelte';
	import { onMount } from 'svelte';
	import type { NewsArticle } from '$lib/types/news';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let readArticles = $state<(NewsArticle & { readAt: string; readDuration?: number; readPercentage?: number })[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let hasMore = $state(true);
	let currentPage = $state(1);
	let isLoadingMore = $state(false);

	async function loadReadingHistory(append = false) {
		try {
			if (!append) {
				isLoading = true;
				readArticles = [];
				currentPage = 1;
			} else {
				isLoadingMore = true;
				currentPage++;
			}

			const response = await fetch(`/api/user/reading-history?page=${currentPage}&limit=20`);
			
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/auth/login';
					return;
				}
				throw new Error('Failed to load reading history');
			}

			const result = await response.json();
			
			if (result.success && result.data) {
				const newArticles = result.data.articles || result.data;
				
				if (append) {
					readArticles = [...readArticles, ...newArticles];
				} else {
					readArticles = newArticles;
				}
				
				hasMore = newArticles.length >= 20;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load reading history';
		} finally {
			isLoading = false;
			isLoadingMore = false;
		}
	}

	function loadMore() {
		if (!isLoadingMore && hasMore) {
			loadReadingHistory(true);
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

	function formatReadTime(readAt: string) {
		const date = new Date(readAt);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString();
	}

	function formatDuration(seconds?: number) {
		if (!seconds) return null;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 1) return '< 1 min';
		return `${minutes} min`;
	}

	onMount(() => {
		loadReadingHistory();
		window.addEventListener('scroll', handleScroll);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>Reading History - Genje News</title>
	<meta name="description" content="Your reading history on Genje News" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-4 mb-4">
				<a href="/profile" class="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to Profile
				</a>
			</div>
			
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h1 class="text-3xl font-bold text-foreground">Reading History</h1>
					<p class="text-muted-foreground">Articles you've read recently</p>
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
				<h2 class="text-xl font-semibold text-red-600 mb-2">Error Loading History</h2>
				<p class="text-muted-foreground mb-4">{error}</p>
				<button 
					onclick={() => loadReadingHistory()} 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Try Again
				</button>
			</div>
		{:else if readArticles.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
					<svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-foreground mb-2">No Reading History</h2>
				<p class="text-muted-foreground mb-4">Start reading articles to build your history</p>
				<a 
					href="/" 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Browse Articles
				</a>
			</div>
		{:else}
			<div class="space-y-6">
				{#each readArticles as article (article.id)}
					<div class="bg-card rounded-xl border shadow-sm overflow-hidden">
						<div class="md:flex">
							<!-- Article Image -->
							{#if article.image_url}
								<div class="md:w-48 h-48 md:h-auto">
									<img
										src={article.image_url}
										alt={article.title}
										class="w-full h-full object-cover"
										loading="lazy"
									/>
								</div>
							{/if}
							
							<!-- Article Content -->
							<div class="flex-1 p-6">
								<div class="flex items-start justify-between mb-3">
									<div class="flex items-center gap-2">
										<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
											{article.category}
										</span>
										<span class="text-xs text-muted-foreground">
											{formatReadTime(article.readAt)}
										</span>
									</div>
									
									<!-- Reading Stats -->
									<div class="flex items-center gap-3 text-xs text-muted-foreground">
										{#if article.readDuration}
											<div class="flex items-center gap-1">
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{formatDuration(article.readDuration)}
											</div>
										{/if}
										{#if article.readPercentage}
											<div class="flex items-center gap-1">
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
												</svg>
												{article.readPercentage}% read
											</div>
										{/if}
									</div>
								</div>
								
								<a href="/article/{article.id}" class="block group">
									<h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
										{article.title}
									</h3>
								</a>
								
								<p class="text-muted-foreground text-sm line-clamp-2 mb-4">
									{article.summary || article.content.substring(0, 150) + '...'}
								</p>
								
								<div class="flex items-center justify-between">
									<div class="flex items-center text-xs text-muted-foreground">
										<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
										</svg>
										{article.source}
									</div>
									
									<a 
										href="/article/{article.id}"
										class="text-xs text-primary hover:text-primary/80 font-medium"
									>
										Read Again →
									</a>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Load More -->
			{#if hasMore}
				<div class="flex justify-center mt-8">
					{#if isLoadingMore}
						<div class="flex items-center gap-2 text-muted-foreground">
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							Loading more history...
						</div>
					{:else}
						<button 
							onclick={loadMore}
							class="px-6 py-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
						>
							Load More History
						</button>
					{/if}
				</div>
			{:else if readArticles.length > 0}
				<div class="text-center mt-8 py-4 text-muted-foreground">
					You've reached the end of your reading history
				</div>
			{/if}
		{/if}
	</div>
</div>