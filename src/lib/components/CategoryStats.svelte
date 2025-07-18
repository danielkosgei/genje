<script lang="ts">
    import { newsAPI } from '$lib/api/news';
    import { onMount } from 'svelte';
    
    let categories = $state<string[]>([]);
    let isLoading = $state(true);
    
    async function loadCategories() {
        try {
            const response = await newsAPI.getCategories();
            categories = response;
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            isLoading = false;
        }
    }
    
    const categoryIcons = {
        diaspora: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        kiswahili: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
        news: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2'
    };
    
    const categoryColors = {
        diaspora: 'bg-blue-500/10 text-blue-600',
        kiswahili: 'bg-green-500/10 text-green-600',
        news: 'bg-purple-500/10 text-purple-600'
    };
    
    function handleCategoryClick(category: string) {
        window.dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category, searchQuery: '' }
        }));
    }
    
    onMount(() => {
        loadCategories();
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Categories</h2>
    </div>
    
    {#if isLoading}
        <div class="space-y-3">
            {#each Array(3) as _}
                <div class="animate-pulse">
                    <div class="h-12 bg-muted rounded-lg"></div>
                </div>
            {/each}
        </div>
    {:else if categories.length > 0}
        <div class="space-y-3">
            {#each categories as category}
                <button 
                    onclick={() => handleCategoryClick(category)}
                    class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center {categoryColors[category] || 'bg-muted text-muted-foreground'}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={categoryIcons[category] || categoryIcons.news} />
                        </svg>
                    </div>
                    <div class="flex-1 text-left">
                        <h3 class="font-medium text-foreground group-hover:text-primary transition-colors capitalize">
                            {category}
                        </h3>
                        <p class="text-xs text-muted-foreground">
                            {category === 'diaspora' ? 'International Kenyan news' : 
                             category === 'kiswahili' ? 'News in Swahili' : 
                             'General news coverage'}
                        </p>
                    </div>
                    <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">No categories available</p>
    {/if}
</div>