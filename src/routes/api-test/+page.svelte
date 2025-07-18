<script lang="ts">
    import { onMount } from 'svelte';
    import { newsAPI } from '$lib/api/news';
    import { Button } from '$lib/components/ui/button';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    
    let testResults = $state<any>({});
    let isLoading = $state(false);

    async function testEndpoint(name: string, testFn: () => Promise<any>) {
        try {
            testResults[name] = { status: 'loading' };
            const result = await testFn();
            testResults[name] = { status: 'success', data: result };
        } catch (error) {
            testResults[name] = { 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    async function runAllTests() {
        isLoading = true;
        testResults = {};
        
        await Promise.all([
            testEndpoint('Recent Articles', () => newsAPI.getRecentArticles(5)),
            testEndpoint('Categories', () => newsAPI.getCategories()),
            testEndpoint('Sources', () => newsAPI.getSources()),
            testEndpoint('Search', () => newsAPI.searchArticles('Kenya', 3)),
            testEndpoint('Trending', () => newsAPI.getTrendingArticles(3))
        ]);
        
        isLoading = false;
    }

    onMount(() => {
        runAllTests();
    });
</script>

<svelte:head>
    <title>API Test - Genje News</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <header class="border-b bg-card/50 backdrop-blur-sm">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-xl font-bold">API Test Dashboard</h1>
                </div>
                <div class="flex gap-2">
                    <Button variant="outline" href="/">Back to News</Button>
                    <Button onclick={runAllTests} disabled={isLoading}>
                        {isLoading ? 'Testing...' : 'Run Tests'}
                    </Button>
                </div>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-4 py-8">
        {#if isLoading}
            <LoadingSpinner />
        {:else}
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each Object.entries(testResults) as [name, result]}
                    <div class="rounded-lg border bg-card p-4">
                        <div class="flex items-center gap-2 mb-3">
                            {#if result.status === 'success'}
                                <div class="h-3 w-3 rounded-full bg-green-500"></div>
                            {:else if result.status === 'error'}
                                <div class="h-3 w-3 rounded-full bg-red-500"></div>
                            {:else}
                                <div class="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
                            {/if}
                            <h3 class="font-semibold">{name}</h3>
                        </div>
                        
                        {#if result.status === 'success'}
                            <div class="text-sm text-muted-foreground">
                                <p class="mb-2">✅ Success</p>
                                {#if Array.isArray(result.data)}
                                    <p>Returned {result.data.length} items</p>
                                {:else if result.data?.data}
                                    <p>Returned {result.data.data.length} articles</p>
                                    {#if result.data.meta}
                                        <p>Total: {result.data.meta.total}</p>
                                    {/if}
                                {:else}
                                    <p>Data received</p>
                                {/if}
                            </div>
                        {:else if result.status === 'error'}
                            <div class="text-sm text-red-600">
                                <p class="mb-2">❌ Error</p>
                                <p class="font-mono text-xs bg-red-50 p-2 rounded">
                                    {result.error}
                                </p>
                            </div>
                        {:else}
                            <div class="text-sm text-yellow-600">
                                <p>⏳ Loading...</p>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}

        {#if Object.keys(testResults).length > 0 && !isLoading}
            <div class="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 class="font-semibold mb-2">Test Summary</h3>
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">
                            {Object.values(testResults).filter(r => r.status === 'success').length}
                        </div>
                        <div class="text-muted-foreground">Passed</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">
                            {Object.values(testResults).filter(r => r.status === 'error').length}
                        </div>
                        <div class="text-muted-foreground">Failed</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">
                            {Object.keys(testResults).length}
                        </div>
                        <div class="text-muted-foreground">Total</div>
                    </div>
                </div>
            </div>
        {/if}
    </main>
</div>