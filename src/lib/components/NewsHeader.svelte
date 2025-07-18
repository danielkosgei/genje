<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    
    const categories = [
        'all',
        'technology',
        'business',
        'sports',
        'entertainment',
        'health',
        'science',
        'general'
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
</script>

<header class="border-b bg-card/50 backdrop-blur-sm">
    <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
                <h1 class="text-xl font-bold">NewsFlow</h1>
            </div>
            
            <div class="relative">
                <input
                    type="search"
                    placeholder="Search news..."
                    class="w-full rounded-md border bg-background px-4 py-2 pr-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-64"
                    bind:value={searchQuery}
                    onkeyup={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onclick={handleSearch}
                    aria-label="Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="mt-4 flex flex-wrap gap-2">
            {#each categories as category}
                <Button
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onclick={() => handleCategorySelect(category)}
                >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
            {/each}
        </div>
    </div>
</header>
