<script lang="ts">
    import { newsAPI } from '$lib/api/news';
    import type { NewsSource } from '$lib/types/news';
    import { onMount } from 'svelte';
    
    let sources = $state<NewsSource[]>([]);
    let isLoading = $state(true);
    
    async function loadSources() {
        try {
            const response = await newsAPI.getSources();
            if (Array.isArray(response)) {
                sources = response.slice(0, 6); // Show top 6 sources
            }
        } catch (error) {
            console.error('Failed to load sources:', error);
        } finally {
            isLoading = false;
        }
    }
    
    function getSourceInitials(name: string): string {
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }
    
    function getSourceColor(index: number): string {
        const colors = [
            'bg-red-500/10 text-red-600',
            'bg-blue-500/10 text-blue-600',
            'bg-green-500/10 text-green-600',
            'bg-purple-500/10 text-purple-600',
            'bg-orange-500/10 text-orange-600',
            'bg-pink-500/10 text-pink-600'
        ];
        return colors[index % colors.length];
    }
    
    onMount(() => {
        loadSources();
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">News Sources</h2>
    </div>
    
    {#if isLoading}
        <div class="grid grid-cols-2 gap-3">
            {#each Array(6) as _}
                <div class="animate-pulse">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-muted rounded-lg"></div>
                        <div class="flex-1">
                            <div class="h-3 bg-muted rounded mb-1"></div>
                            <div class="h-2 bg-muted rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if sources.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {#each sources as source, index}
                <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-border/30"
                >
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold {getSourceColor(index)}">
                        {getSourceInitials(source.name)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {source.name}
                        </h3>
                        <p class="text-xs text-muted-foreground capitalize">
                            {source.category}
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">No sources available</p>
    {/if}
</div>