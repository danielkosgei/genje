<script lang="ts">
    import { onMount } from 'svelte';
    
    let bookmarks = $state<Array<{id: number, title: string, source: string, date: string}>>([]);
    let isLoading = $state(true);
    
    function loadBookmarks() {
        // In a real app, this would load from localStorage or API
        const stored = localStorage.getItem('genje-bookmarks');
        if (stored) {
            bookmarks = JSON.parse(stored);
        } else {
            // Sample bookmarks for demo
            bookmarks = [
                {
                    id: 1,
                    title: "Kenya's Economic Growth Outlook for 2025",
                    source: "Business Daily",
                    date: "2025-07-18"
                },
                {
                    id: 2,
                    title: "New Education Reforms Announced",
                    source: "Daily Nation",
                    date: "2025-07-17"
                },
                {
                    id: 3,
                    title: "Technology Hub Expansion in Nairobi",
                    source: "Tech Kenya",
                    date: "2025-07-16"
                }
            ];
        }
        isLoading = false;
    }
    
    function removeBookmark(id: number) {
        bookmarks = bookmarks.filter(b => b.id !== id);
        localStorage.setItem('genje-bookmarks', JSON.stringify(bookmarks));
    }
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    onMount(() => {
        setTimeout(loadBookmarks, 400);
    });
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </div>
            <h2 class="text-lg font-semibold text-foreground">Bookmarks</h2>
        </div>
        <span class="text-xs text-muted-foreground">{bookmarks.length} saved</span>
    </div>
    
    {#if isLoading}
        <div class="space-y-3">
            {#each Array(3) as _}
                <div class="animate-pulse">
                    <div class="h-4 bg-muted rounded mb-2"></div>
                    <div class="h-3 bg-muted rounded w-2/3"></div>
                </div>
            {/each}
        </div>
    {:else if bookmarks.length > 0}
        <div class="space-y-3">
            {#each bookmarks as bookmark}
                <div class="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div class="flex-1 min-w-0">
                        <a 
                            href="/article/{bookmark.id}" 
                            class="block"
                        >
                            <h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {bookmark.title}
                            </h3>
                            <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{bookmark.source}</span>
                                <span>•</span>
                                <span>{formatDate(bookmark.date)}</span>
                            </div>
                        </a>
                    </div>
                    
                    <button 
                        onclick={() => removeBookmark(bookmark.id)}
                        class="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                        title="Remove bookmark"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            {/each}
        </div>
        
        <div class="mt-4 pt-4 border-t border-border/50">
            <button class="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mx-auto">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                View all bookmarks
            </button>
        </div>
    {:else}
        <div class="text-center py-6">
            <div class="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </div>
            <p class="text-sm text-muted-foreground">No bookmarks yet</p>
            <p class="text-xs text-muted-foreground mt-1">Save articles to read later</p>
        </div>
    {/if}
</div>