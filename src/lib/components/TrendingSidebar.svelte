<script lang="ts">
    import { newsAPI } from '$lib/api/news';
    import type { NewsArticle } from '$lib/types/news';
    import { onMount } from 'svelte';
    
    let trendingArticles = $state<NewsArticle[]>([]);
    let isLoading = $state(true);
    
    async function loadTrending() {
        try {
            const response = await newsAPI.getTrendingArticles(5);
            if (response.success && response.data) {
                trendingArticles = response.data;
            }
        } catch (error) {
            console.error('Failed to load trending articles:', error);
        } finally {
            isLoading = false;
        }
    }
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    onMount(() => {
        loadTrending();
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Trending Now</h2>
    </div>
    
    {#if isLoading}
        <div class="space-y-4">
            {#each Array(5) as _}
                <div class="animate-pulse">
                    <div class="h-4 bg-muted rounded mb-2"></div>
                    <div class="h-3 bg-muted rounded w-2/3"></div>
                </div>
            {/each}
        </div>
    {:else if trendingArticles.length > 0}
        <div class="space-y-4">
            {#each trendingArticles as article, index}
                <a 
                    href="/article/{article.id}" 
                    class="block group hover:bg-muted/50 rounded-lg p-3 -m-3 transition-colors"
                >
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {article.title}
                            </h3>
                            <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{article.source}</span>
                                <span>•</span>
                                <span>{formatDate(article.published_at)}</span>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">No trending articles available</p>
    {/if}
</div>