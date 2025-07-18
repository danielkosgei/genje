<script lang="ts">
    import NewsCard from '$lib/components/NewsCard.svelte';
    import NewsCardSkeleton from '$lib/components/NewsCardSkeleton.svelte';
    import NewsHeader from '$lib/components/NewsHeader.svelte';
    import { mockNews } from '$lib/data/mockNews';
    
    let isLoading = $state(false);
    let searchQuery = $state('');
    let selectedCategory = $state('all');
    let filteredNews = $derived(filterNews());

    function filterNews() {
        let filtered = [...mockNews];
        
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(article => article.category === selectedCategory);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }

    function handleFilterChange(event: CustomEvent) {
        const { category, searchQuery: query } = event.detail;
        selectedCategory = category;
        searchQuery = query;
    }
</script>

<svelte:head>
    <title>NewsFlow - Stay Informed</title>
    <meta name="description" content="Your daily source for the latest news across technology, business, sports, and more." />
</svelte:head>

<div class="flex min-h-screen flex-col">
    <NewsHeader />
    
    <main class="flex-1 bg-background/50">
        <div class="container mx-auto px-4 py-8">
            {#if isLoading}
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {#each Array(6) as _}
                        <NewsCardSkeleton />
                    {/each}
                </div>
            {:else if filteredNews.length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mb-4 h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 class="mb-2 text-xl font-semibold">No news found</h2>
                    <p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
            {:else}
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {#each filteredNews as article (article.id)}
                        <NewsCard {article} />
                    {/each}
                </div>
            {/if}
        </div>
    </main>

    <footer class="border-t bg-card/50 py-6">
        <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} NewsFlow. All rights reserved.</p>
        </div>
    </footer>
</div>

<svelte:window onfilterChange={handleFilterChange} />
