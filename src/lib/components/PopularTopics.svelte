<script lang="ts">
    import { onMount } from 'svelte';
    
    interface TrendingTopic {
        name: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
        color: string;
    }
    
    let topics = $state<TrendingTopic[]>([]);
    let isLoading = $state(true);
    let lastUpdated = $state<string>('');
    let dataSource = $state<string>('loading');
    
    function handleTopicClick(topic: string) {
        window.dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category: 'all', searchQuery: topic.toLowerCase() }
        }));
    }
    
    function getTrendIcon(trend: string) {
        switch (trend) {
            case 'up':
                return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
            case 'down':
                return 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6';
            default:
                return 'M5 12h14';
        }
    }
    
    function getTrendColor(trend: string) {
        switch (trend) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-muted-foreground';
        }
    }
    
    async function loadTrendingTopics() {
        try {
            isLoading = true;
            const response = await fetch('/api/topics/trending');
            
            if (response.ok) {
                const data = await response.json();
                topics = data.topics || [];
                lastUpdated = data.lastUpdated || new Date().toISOString();
                dataSource = data.source || 'unknown';
            } else {
                console.error('Failed to load trending topics');
                // Fallback topics if API fails
                topics = [
                    { name: 'Breaking News', count: 20, trend: 'up', color: 'bg-red-500/10 text-red-600' },
                    { name: 'Politics', count: 15, trend: 'stable', color: 'bg-blue-500/10 text-blue-600' },
                    { name: 'Business', count: 12, trend: 'up', color: 'bg-green-500/10 text-green-600' },
                    { name: 'Sports', count: 8, trend: 'stable', color: 'bg-orange-500/10 text-orange-600' }
                ];
                dataSource = 'fallback';
            }
        } catch (error) {
            console.error('Error loading trending topics:', error);
            // Fallback topics on error
            topics = [
                { name: 'Breaking News', count: 20, trend: 'up', color: 'bg-red-500/10 text-red-600' },
                { name: 'Politics', count: 15, trend: 'stable', color: 'bg-blue-500/10 text-blue-600' },
                { name: 'Business', count: 12, trend: 'up', color: 'bg-green-500/10 text-green-600' },
                { name: 'Sports', count: 8, trend: 'stable', color: 'bg-orange-500/10 text-orange-600' }
            ];
            dataSource = 'fallback';
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadTrendingTopics();
        
        // Refresh trending topics every 10 minutes
        const interval = setInterval(loadTrendingTopics, 10 * 60 * 1000);
        
        return () => clearInterval(interval);
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Popular Topics</h2>
    </div>
    
    {#if isLoading}
        <div class="space-y-3">
            {#each Array(6) as _}
                <div class="animate-pulse">
                    <div class="flex items-center justify-between">
                        <div class="h-4 bg-muted rounded w-20"></div>
                        <div class="h-3 bg-muted rounded w-8"></div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="space-y-3">
            {#each topics as topic}
                <button 
                    onclick={() => handleTopicClick(topic.name)}
                    class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center {topic.color}">
                            <div class="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                        <span class="font-medium text-foreground group-hover:text-primary transition-colors">
                            {topic.name}
                        </span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-muted-foreground">{topic.count}</span>
                        <svg class="w-3 h-3 {getTrendColor(topic.trend)}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getTrendIcon(topic.trend)} />
                        </svg>
                    </div>
                </button>
            {/each}
        </div>
        
        <div class="mt-4 pt-4 border-t border-border/50">
            <div class="flex items-center justify-between">
                <div class="text-xs text-muted-foreground">
                    {#if dataSource === 'analytics'}
                        Based on recent articles
                    {:else if dataSource === 'mixed'}
                        Mixed data & fallback
                    {:else if dataSource === 'fallback'}
                        Fallback topics
                    {:else}
                        Loading...
                    {/if}
                </div>
                <button
                    onclick={loadTrendingTopics}
                    class="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    disabled={isLoading}
                >
                    <svg class="w-3 h-3 {isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoading ? 'Updating...' : 'Refresh'}
                </button>
            </div>
        </div>
    {/if}
</div>