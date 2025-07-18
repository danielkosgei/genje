<script lang="ts">
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsCardSkeleton from '$lib/components/NewsCardSkeleton.svelte';
	import NewsHeader from '$lib/components/NewsHeader.svelte';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import TrendingSidebar from '$lib/components/TrendingSidebar.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import RecentSources from '$lib/components/RecentSources.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import FloatingActions from '$lib/components/FloatingActions.svelte';
	import PopularTopics from '$lib/components/PopularTopics.svelte';
	import { newsAPI } from '$lib/api/news';
	import type { NewsArticle } from '$lib/types/news';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(true);
	let isLoadingMore = $state(false);
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let articles = $state<NewsArticle[]>([]);
	let error = $state<string | null>(null);
	let hasMore = $state(true);
	let lastLoadedCount = $state(0);

	async function loadArticles(append = false) {
		try {
			if (!append) {
				isLoading = true;
				articles = [];
				hasMore = true;
			} else {
				isLoadingMore = true;
			}
			error = null;

			let response;
			const limit = append ? 10 : 20; // Load fewer items when appending

			if (searchQuery.trim()) {
				response = await newsAPI.searchArticles(searchQuery.trim(), limit);
			} else if (selectedCategory !== 'all') {
				response = await newsAPI.getArticlesByCategory(selectedCategory, limit);
			} else {
				response = await newsAPI.getRecentArticles(limit);
			}

			if (response.success && response.data) {
				const newArticles = response.data;
				lastLoadedCount = newArticles.length;

				if (append) {
					// Filter out duplicates when appending
					const existingIds = new Set(articles.map((a) => a.id));
					const uniqueNewArticles = newArticles.filter((a) => !existingIds.has(a.id));
					articles = [...articles, ...uniqueNewArticles];
					hasMore = uniqueNewArticles.length > 0 && newArticles.length === limit;
				} else {
					articles = newArticles;
					hasMore = newArticles.length === limit;
				}
			} else {
				throw new Error('Invalid API response');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load articles';
			console.error('Error loading articles:', err);
			hasMore = false;
		} finally {
			isLoading = false;
			isLoadingMore = false;
		}
	}

	function handleFilterChange(event: Event) {
		const customEvent = event as CustomEvent;
		const { category, searchQuery: query } = customEvent.detail;
		selectedCategory = category;
		searchQuery = query;
		loadArticles(false); // Reset and load fresh
	}

	function loadMore() {
		if (!isLoadingMore && hasMore) {
			loadArticles(true);
		}
	}

	// Infinite scroll implementation
	function handleScroll() {
		if (isLoadingMore || !hasMore) return;

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Load more when user is 200px from bottom
		if (scrollTop + windowHeight >= documentHeight - 200) {
			loadMore();
		}
	}

	onMount(() => {
		loadArticles(false);

		// Listen for filter changes from header
		window.addEventListener('filterChange', handleFilterChange);

		// Add scroll listener for infinite scroll
		window.addEventListener('scroll', handleScroll);

		// Update mini clock every minute
		const updateMiniClock = () => {
			const clockElement = document.getElementById('mini-clock');
			if (clockElement) {
				clockElement.textContent = new Date().toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				});
			}
		};

		const clockInterval = setInterval(updateMiniClock, 60000); // Update every minute

		return () => {
			window.removeEventListener('filterChange', handleFilterChange);
			window.removeEventListener('scroll', handleScroll);
			clearInterval(clockInterval);
		};
	});
</script>

<svelte:head>
	<title>Genje News - Kenyan News Aggregator</title>
	<meta
		name="description"
		content="Stay informed with the latest Kenyan news from multiple sources. Get news in English and Kiswahili, diaspora updates, and more."
	/>
</svelte:head>

<div
	class="from-background via-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-br"
>
	<NewsHeader user={data?.user} />

	<!-- Hero Section -->
	<section class="from-primary/10 via-primary/5 border-b bg-gradient-to-r to-transparent">
		<div class="container mx-auto px-4 py-8">
			<div class="text-center">
				<h1 class="text-foreground mb-2 text-3xl font-bold md:text-4xl">
					Stay Informed with Kenyan News
				</h1>
				<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
					Get the latest news from multiple sources across Kenya, in English and Kiswahili
				</p>
			</div>
		</div>
	</section>

	<main class="flex-1">
		<div class="container mx-auto px-4 py-8">
			<div class="flex gap-8">
				<!-- Left Sidebar - Desktop Only -->
				<aside class="hidden w-72 flex-shrink-0 2xl:block">
					<div class="sticky top-24 space-y-6">
						<PopularTopics />
						<NewsletterSignup />
					</div>
				</aside>

				<!-- Main Content -->
				<div class="min-w-0 flex-1">
					{#if error && articles.length === 0}
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mb-4 h-12 w-12 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h2 class="mb-2 text-xl font-semibold text-red-600">Error Loading News</h2>
							<p class="text-muted-foreground mb-4">{error}</p>
							<button
								class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
								onclick={() => loadArticles(false)}
							>
								Try Again
							</button>
						</div>
					{:else if isLoading && articles.length === 0}
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each Array(6) as _}
								<NewsCardSkeleton />
							{/each}
						</div>
					{:else if articles.length === 0}
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-muted-foreground mb-4 h-12 w-12"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h2 class="mb-2 text-xl font-semibold">No news found</h2>
							<p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
						</div>
					{:else}
						<!-- Articles count and filters info -->
						<div class="mb-6 flex items-center justify-between">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
									/>
								</svg>
								<span>{articles.length} articles</span>
								{#if selectedCategory !== 'all'}
									<span>in {selectedCategory}</span>
								{/if}
								{#if searchQuery}
									<span>matching "{searchQuery}"</span>
								{/if}
							</div>

							{#if searchQuery || selectedCategory !== 'all'}
								<button
									class="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
									onclick={() => {
										selectedCategory = 'all';
										searchQuery = '';
										window.dispatchEvent(
											new CustomEvent('filterChange', {
												detail: { category: 'all', searchQuery: '' }
											})
										);
									}}
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
									Clear filters
								</button>
							{/if}
						</div>

						<!-- Articles grid with staggered animation -->
						<div class="grid gap-8 sm:grid-cols-2 xl:grid-cols-2">
							{#each articles as article, index (article.id)}
								<div
									class="animate-fade-in-up"
									style="animation-delay: {Math.min(index * 100, 500)}ms"
								>
									<NewsCard {article} user={data?.user} />
								</div>
							{/each}
						</div>

						<!-- Infinite scroll loading indicator -->
						{#if isLoadingMore}
							<div class="mt-12 flex justify-center">
								<div
									class="bg-card flex items-center gap-3 rounded-full border px-6 py-3 shadow-sm"
								>
									<div
										class="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
									></div>
									<span class="text-muted-foreground text-sm font-medium"
										>Loading more articles...</span
									>
								</div>
							</div>
						{:else if hasMore}
							<div class="mt-12 text-center">
								<button
									class="group bg-primary text-primary-foreground hover:bg-primary/90 mx-auto flex items-center gap-2 rounded-full px-8 py-3 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
									onclick={loadMore}
									disabled={isLoadingMore}
								>
									<span>Load More Articles</span>
									<svg
										class="h-4 w-4 transition-transform group-hover:translate-y-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 14l-7 7m0 0l-7-7m7 7V3"
										/>
									</svg>
								</button>
							</div>
						{:else if articles.length > 0}
							<div class="mt-12 text-center">
								<div
									class="bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									You've reached the end of the news feed
								</div>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Right Sidebar - Desktop Only -->
				<aside class="hidden w-80 flex-shrink-0 xl:block">
					<div class="sticky top-24 space-y-6">
						<TrendingSidebar />
						<QuickActions />
					</div>
				</aside>
			</div>
		</div>
	</main>

	<footer class="bg-card/50 mt-16 border-t py-8">
		<div class="container mx-auto px-4">
			<!-- News Sources Section -->
			<div class="mb-8">
				<h3 class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
					<svg class="text-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
						/>
					</svg>
					Our News Sources
				</h3>
				<RecentSources />
			</div>

			<!-- Footer Bottom -->
			<div class="border-border/50 border-t pt-6">
				<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div class="flex items-center gap-3">
						<div class="bg-primary flex h-6 w-6 items-center justify-center rounded">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary-foreground h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
								/>
							</svg>
						</div>
						<span class="text-foreground font-semibold">Genje News</span>
					</div>
					<div class="text-muted-foreground flex items-center gap-6 text-sm">
						<a href="/api-test" class="hover:text-foreground transition-colors">API Status</a>
						<span>•</span>
						<a href="/about" class="hover:text-foreground transition-colors">About</a>
						<span>•</span>
						<a href="/contact" class="hover:text-foreground transition-colors">Contact</a>
						<span>•</span>
						<span>© {new Date().getFullYear()} All rights reserved</span>
					</div>
				</div>
			</div>
		</div>
	</footer>

	<BackToTop />
	<MobileBottomNav />
	<FloatingActions />
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.6s ease-out forwards;
		opacity: 0;
	}

	/* Smooth scrolling */
	:global(html) {
		scroll-behavior: smooth;
	}

	/* Custom scrollbar */
	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: hsl(var(--muted));
	}

	:global(::-webkit-scrollbar-thumb) {
		background: hsl(var(--muted-foreground) / 0.3);
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: hsl(var(--muted-foreground) / 0.5);
	}
</style>
