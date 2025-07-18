<script lang="ts">
    import { newsAPI } from '$lib/api/news';
    import { onMount } from 'svelte';
    
    let stats = $state({
        totalArticles: 0,
        todayArticles: 0,
        sources: 0,
        categories: 0
    });
    let isLoading = $state(true);
    
    async function loadStats() {
        try {
            // Load recent articles to get count
            const articlesResponse = await newsAPI.getRecentArticles(100);
            const sourcesResponse = await newsAPI.getSources();
            const categoriesResponse = await newsAPI.getCategories();
            
            if (articlesResponse.success && articlesResponse.data) {
                const articles = articlesResponse.data;
                const today = new Date().toDateString();
                const todayCount = articles.filter(article => 
                    new Date(article.published_at).toDateString() === today
                ).length;
                
                stats = {
                    totalArticles: articlesResponse.meta?.total || articles.length,
                    todayArticles: todayCount,
                    sources: Array.isArray(sourcesResponse) ? sourcesResponse.length : 0,
                    categories: Array.isArray(categoriesResponse) ? categoriesResponse.length : 0
                };
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            isLoading = false;
        }
    }
    
    onMount(() => {
        loadStats();
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">News Stats</h2>
    </div>
    
    {#if isLoading}
        <div class="grid grid-cols-2 gap-4">
            {#each Array(4) as _}
                <div class="animate-pulse">
                    <div class="h-8 bg-muted rounded mb-1"></div>
                    <div class="h-4 bg-muted rounded w-2/3"></div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-muted/30 rounded-lg">
                <div class="text-2xl font-bold text-foreground">{stats.totalArticles.toLocaleString()}</div>
                <div class="text-xs text-muted-foreground">Total Articles</div>
            </div>
            
            <div class="text-center p-3 bg-primary/5 rounded-lg">
                <div class="text-2xl font-bold text-primary">{stats.todayArticles}</div>
                <div class="text-xs text-muted-foreground">Today</div>
            </div>
            
            <div class="text-center p-3 bg-blue-500/5 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{stats.sources}</div>
                <div class="text-xs text-muted-foreground">Sources</div>
            </div>
            
            <div class="text-center p-3 bg-green-500/5 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{stats.categories}</div>
                <div class="text-xs text-muted-foreground">Categories</div>
            </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-border/50">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated</span>
                <span>{new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    {/if}
</div>