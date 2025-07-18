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
	let currentPage = $state(1);
	let totalLoaded = $state(0);

	function loadMockData() {
		// Mock data for development when API is unavailable
		const mockArticles: NewsArticle[] = [
			{
				id: 1,
				title: "Kenya's Economy Shows Strong Growth in Q4 2024",
				content: "Kenya's economy has demonstrated remarkable resilience with a 5.2% growth rate in the fourth quarter of 2024, driven by strong performance in agriculture and technology sectors...",
				author: "Economic Reporter",
				published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Business Daily",
				url: "https://example.com/economy-growth",
				image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Kenya's economy grows 5.2% in Q4 2024, showing strong resilience."
			},
			{
				id: 2,
				title: "Nairobi Launches New Digital Payment System for Public Transport",
				content: "The Nairobi County Government has officially launched a comprehensive digital payment system for all public transport vehicles, making commuting easier for millions of residents...",
				author: "Transport Correspondent",
				published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "The Standard",
				url: "https://example.com/digital-transport",
				image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Nairobi introduces digital payments for public transport."
			},
			{
				id: 3,
				title: "Kenyan Diaspora Contributes Record $4.2 Billion in Remittances",
				content: "Kenyan diaspora communities worldwide have sent home a record-breaking $4.2 billion in remittances this year, supporting families and boosting the national economy...",
				author: "Diaspora Reporter",
				published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Nation Media",
				url: "https://example.com/diaspora-remittances",
				image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=400&fit=crop",
				category: "diaspora" as const,
				summary: "Record $4.2B in diaspora remittances supports Kenya's economy."
			},
			{
				id: 4,
				title: "Harambee Stars Qualify for AFCON 2025",
				content: "Kenya's national football team, Harambee Stars, has secured qualification for the Africa Cup of Nations 2025 after a thrilling 2-1 victory over Tanzania in Nairobi...",
				author: "Sports Writer",
				published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Sports Kenya",
				url: "https://example.com/harambee-stars-afcon",
				image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Harambee Stars qualify for AFCON 2025 with victory over Tanzania."
			},
			{
				id: 5,
				title: "New University Campus Opens in Mombasa",
				content: "A state-of-the-art university campus has opened in Mombasa, offering cutting-edge programs in marine science, logistics, and international trade...",
				author: "Education Reporter",
				published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Education News",
				url: "https://example.com/mombasa-university",
				image_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "New university campus in Mombasa focuses on marine science and trade."
			},
			{
				id: 6,
				title: "Kenya Launches Green Energy Initiative",
				content: "The government has launched an ambitious green energy initiative aimed at achieving 100% renewable energy by 2030, with major investments in solar and wind power...",
				author: "Environment Correspondent",
				published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Green Kenya",
				url: "https://example.com/green-energy",
				image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Kenya targets 100% renewable energy by 2030 with new initiative."
			}
		];

		articles = mockArticles;
		totalLoaded = mockArticles.length;
		hasMore = true; // Allow loading more mock data
		error = null;
		console.log('Mock data loaded:', mockArticles.length, 'articles');
	}

	function loadMoreMockData() {
		// Generate additional mock articles for infinite scroll testing
		const additionalMockArticles: NewsArticle[] = [
			{
				id: totalLoaded + 1,
				title: "Kenya Signs Major Trade Deal with European Union",
				content: "Kenya has signed a comprehensive trade agreement with the European Union, opening new markets for Kenyan exports and creating thousands of jobs...",
				author: "Trade Reporter",
				published_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Trade Weekly",
				url: "https://example.com/eu-trade-deal",
				image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Kenya-EU trade deal creates new export opportunities."
			},
			{
				id: totalLoaded + 2,
				title: "Mombasa Port Handles Record Cargo Volume",
				content: "The Port of Mombasa has achieved a new milestone by handling over 1.5 million TEUs in a single month, demonstrating Kenya's growing role as a regional logistics hub...",
				author: "Port Correspondent",
				published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Maritime News",
				url: "https://example.com/mombasa-port-record",
				image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Mombasa Port achieves record cargo handling milestone."
			},
			{
				id: totalLoaded + 3,
				title: "Kenyan Tech Startup Raises $50M in Series B Funding",
				content: "A Nairobi-based fintech startup has successfully raised $50 million in Series B funding, marking one of the largest investment rounds in East Africa this year...",
				author: "Tech Reporter",
				published_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Tech Africa",
				url: "https://example.com/fintech-funding",
				image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Kenyan fintech raises $50M in major funding round."
			},
			{
				id: totalLoaded + 4,
				title: "New Wildlife Conservancy Opens in Maasai Mara",
				content: "A new community-owned wildlife conservancy has been established in the Maasai Mara ecosystem, providing additional protection for endangered species...",
				author: "Conservation Writer",
				published_at: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Wildlife Kenya",
				url: "https://example.com/maasai-mara-conservancy",
				image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "New Maasai Mara conservancy protects endangered wildlife."
			},
			{
				id: totalLoaded + 5,
				title: "Kenya's Coffee Exports Reach 10-Year High",
				content: "Kenyan coffee exports have reached their highest level in a decade, with premium Arabica beans commanding top prices in international markets...",
				author: "Agriculture Reporter",
				published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				source: "Farm Kenya",
				url: "https://example.com/coffee-exports-high",
				image_url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=400&fit=crop",
				category: "news" as const,
				summary: "Kenyan coffee exports hit 10-year high with premium prices."
			}
		];

		articles = [...articles, ...additionalMockArticles];
		totalLoaded = articles.length;
		
		// Simulate reaching end of data after a few loads
		if (totalLoaded >= 20) {
			hasMore = false;
		}
		
		console.log('Additional mock data loaded:', additionalMockArticles.length, 'articles. Total:', totalLoaded);
	}

	async function loadArticles(append = false) {
		try {
			if (!append) {
				isLoading = true;
				articles = [];
				hasMore = true;
				currentPage = 1;
				totalLoaded = 0;
			} else {
				isLoadingMore = true;
				currentPage++;
			}
			error = null;

			let response;
			const limit = 20;

			// Use different strategies based on what we're loading
			if (searchQuery.trim()) {
				// For search, we'll load progressively larger batches
				const searchLimit = limit * currentPage;
				response = await newsAPI.searchArticles(searchQuery.trim(), searchLimit);
			} else if (selectedCategory !== 'all') {
				// For categories, we'll load progressively larger batches
				const categoryLimit = limit * currentPage;
				response = await newsAPI.getArticlesByCategory(selectedCategory, categoryLimit);
			} else {
				// For general articles, use proper pagination
				response = await newsAPI.getArticles(currentPage, limit);
			}

			console.log('API Response:', response);

			if (response && response.success && response.data) {
				const newArticles = response.data;

				if (append) {
					if (searchQuery.trim() || selectedCategory !== 'all') {
						// For search/category, we get all results and need to extract new ones
						const existingIds = new Set(articles.map((a) => a.id));
						const uniqueNewArticles = newArticles.filter((a) => !existingIds.has(a.id));
						
						if (uniqueNewArticles.length === 0) {
							hasMore = false;
							currentPage--; // Revert page increment
						} else {
							// Add only the new articles that weren't already loaded
							const articlesToAdd = uniqueNewArticles.slice(-limit); // Get the last 'limit' articles
							articles = [...articles, ...articlesToAdd];
							totalLoaded = articles.length;
							hasMore = newArticles.length >= limit * currentPage;
						}
					} else {
						// For general articles, just append the new page
						if (newArticles.length === 0) {
							hasMore = false;
							currentPage--; // Revert page increment
						} else {
							articles = [...articles, ...newArticles];
							totalLoaded = articles.length;
							hasMore = newArticles.length === limit;
						}
					}
				} else {
					// Initial load
					articles = newArticles;
					totalLoaded = newArticles.length;
					hasMore = newArticles.length >= limit;
				}

				console.log('Articles loaded:', {
					append,
					newCount: newArticles.length,
					totalArticles: articles.length,
					hasMore,
					currentPage,
					searchQuery: searchQuery || 'none',
					category: selectedCategory
				});
			} else {
				throw new Error('Invalid API response');
			}
		} catch (err) {
			console.error('API Error Details:', err);
			console.error('Response was:', response);
			
			// Check if it's a network error or API error
			if (err instanceof Error && err.message.includes('fetch')) {
				error = 'Unable to connect to news API. Please check your internet connection.';
			} else if (err instanceof Error && err.message.includes('API Error:')) {
				error = `News API Error: ${err.message}`;
			} else {
				error = err instanceof Error ? err.message : 'Failed to load articles';
			}
			
			// Load mock data as fallback for development
			if (!append && articles.length === 0) {
				console.log('Loading mock data as fallback...');
				loadMockData();
			} else if (append && articles.length > 0) {
				// If we're appending and already have mock data, load more mock data
				console.log('Loading more mock data for infinite scroll...');
				loadMoreMockData();
			} else {
				hasMore = false;
				if (append) {
					currentPage--; // Revert page increment on error
				}
			}
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

		// Load more when user is 300px from bottom (increased threshold)
		if (scrollTop + windowHeight >= documentHeight - 300) {
			console.log('Infinite scroll triggered:', { 
				scrollTop, 
				windowHeight, 
				documentHeight, 
				hasMore, 
				isLoadingMore,
				totalLoaded,
				articlesCount: articles.length
			});
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
