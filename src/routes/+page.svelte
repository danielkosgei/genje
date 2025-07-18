<script lang="ts">
    import NewsCard from '$lib/components/NewsCard.svelte';
    import NewsCardSkeleton from '$lib/components/NewsCardSkeleton.svelte';
    import NewsHeader from '$lib/components/NewsHeader.svelte';
    import BackToTop from '$lib/components/BackToTop.svelte';
    import { newsAPI } from '$lib/api/news';
    import type { NewsArticle } from '$lib/types/news';
    import { onMount } from 'svelte';
    
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
                    const existingIds = new Set(articles.map(a => a.id));
                    const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a.id));
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
        
        return () => {
            window.removeEventListener('filterChange', handleFilterChange);
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<svelte:head>
    <title>Genje News - Kenyan News Aggregator</title>
    <meta name="description" content="Stay informed with the latest Kenyan news from multiple sources. Get news in English and Kiswahili, diaspora updates, and more." />
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
    <NewsHeader />
    
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div class="container mx-auto px-4 py-8">
            <div class="text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Stay Informed with Kenyan News
                </h1>
                <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Get the latest news from multiple sources across Kenya, in English and Kiswahili
                </p>
            </div>
        </div>
    </section>
    
    <main class="flex-1">
        <div class="container mx-auto px-4 py-8">
            {#if error && articles.length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mb-4 h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 class="mb-2 text-xl font-semibold text-red-600">Error Loading News</h2>
                    <p class="text-muted-foreground mb-4">{error}</p>
                    <button 
                        class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="mb-4 h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 class="mb-2 text-xl font-semibold">No news found</h2>
                    <p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
            {:else}
                <!-- Articles count and filters info -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
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
                            class="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                            onclick={() => {
                                selectedCategory = 'all';
                                searchQuery = '';
                                window.dispatchEvent(new CustomEvent('filterChange', { 
                                    detail: { category: 'all', searchQuery: '' }
                                }));
                            }}
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear filters
                        </button>
                    {/if}
                </div>

                <!-- Articles grid with staggered animation -->
                <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {#each articles as article, index (article.id)}
                        <div 
                            class="animate-fade-in-up"
                            style="animation-delay: {Math.min(index * 100, 500)}ms"
                        >
                            <NewsCard {article} />
                        </div>
                    {/each}
                </div>
                
                <!-- Infinite scroll loading indicator -->
                {#if isLoadingMore}
                    <div class="mt-12 flex justify-center">
                        <div class="flex items-center gap-3 px-6 py-3 bg-card rounded-full shadow-sm border">
                            <div class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                            <span class="text-sm font-medium text-muted-foreground">Loading more articles...</span>
                        </div>
                    </div>
                {:else if hasMore}
                    <div class="mt-12 text-center">
                        <button 
                            class="group px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
                            onclick={loadMore}
                            disabled={isLoadingMore}
                        >
                            <span>Load More Articles</span>
                            <svg class="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                {:else if articles.length > 0}
                    <div class="mt-12 text-center">
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            You've reached the end of the news feed
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </main>

    <footer class="border-t bg-card/50 py-8 mt-16">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-6 h-6 bg-primary rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                        </svg>
                    </div>
                    <span class="font-semibold text-foreground">Genje News</span>
                </div>
                <div class="flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="/api-test" class="hover:text-foreground transition-colors">API Status</a>
                    <span>•</span>
                    <span>© {new Date().getFullYear()} All rights reserved</span>
                </div>
            </div>
        </div>
    </footer>
    
    <BackToTop />
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