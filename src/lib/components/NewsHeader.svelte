<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    
    const categories = [
        'all',
        'diaspora',
        'kiswahili',
        'news'
    ] as const;

    let selectedCategory = $state('all');
    let searchQuery = $state('');

    function handleCategorySelect(category: string) {
        selectedCategory = category;
        dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category, searchQuery },
            bubbles: true 
        }));
    }

    function handleSearch() {
        dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category: selectedCategory, searchQuery },
            bubbles: true 
        }));
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }
</script>

<header class="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md shadow-sm">
    <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-foreground">Genje News</h1>
                    <p class="text-xs text-muted-foreground hidden sm:block">Kenyan News Aggregator</p>
                </div>
            </div>
            
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="search"
                    placeholder="Search Kenyan news..."
                    class="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground"
                    bind:value={searchQuery}
                    onkeypress={handleKeyPress}
                    oninput={handleSearch}
                />
                {#if searchQuery}
                    <button 
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
                        onclick={() => { searchQuery = ''; handleSearch(); }}
                        aria-label="Clear search"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                {/if}
            </div>
        </div>
        
        <div class="mt-6 flex flex-wrap gap-2">
            {#each categories as category}
                <button
                    class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 {selectedCategory === category 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}"
                    onclick={() => handleCategorySelect(category)}
                >
                    {#if category === 'all'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        All News
                    {:else if category === 'diaspora'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Diaspora
                    {:else if category === 'kiswahili'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Kiswahili
                    {:else}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                        </svg>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</header>
