<script lang="ts">
    import { page } from '$app/stores';
    import { newsAPI } from '$lib/api/news';
    import type { NewsArticle } from '$lib/types/news';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { stripHtml } from '$lib/utils/content';
    
    let article = $state<NewsArticle | null>(null);
    let isLoading = $state(true);
    let error = $state<string | null>(null);
    let summary = $state<string | null>(null);
    let isGeneratingSummary = $state(false);

    async function loadArticle() {
        try {
            isLoading = true;
            error = null;
            const id = parseInt($page.params.id);
            article = await newsAPI.getArticleById(id);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load article';
            console.error('Error loading article:', err);
        } finally {
            isLoading = false;
        }
    }

    async function generateSummary() {
        if (!article) return;
        
        try {
            isGeneratingSummary = true;
            const response = await newsAPI.summarizeArticle(article.id);
            summary = response.summary;
        } catch (err) {
            console.error('Error generating summary:', err);
        } finally {
            isGeneratingSummary = false;
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onMount(() => {
        loadArticle();
    });
</script>

<svelte:head>
    {#if article}
        <title>{article.title} - Genje News</title>
        <meta name="description" content={stripHtml(article.content).substring(0, 160)} />
    {:else}
        <title>Article - Genje News</title>
    {/if}
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
    <header class="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <Button variant="ghost" href="/" class="flex items-center gap-2 hover:bg-muted/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to News
                    </Button>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-lg font-bold text-foreground">Genje News</h1>
                        </div>
                    </div>
                </div>
                
                {#if article}
                    <div class="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onclick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                            class="hidden sm:flex"
                        >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Share
                        </Button>
                    </div>
                {/if}
            </div>
        </div>
    </header>

    <main class="container mx-auto px-4 py-8">
        {#if isLoading}
            <div class="max-w-4xl mx-auto">
                <div class="animate-pulse">
                    <!-- Header skeleton -->
                    <div class="mb-8">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="h-6 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full"></div>
                            <div class="h-4 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted rounded"></div>
                            <div class="h-4 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded"></div>
                        </div>
                        <div class="space-y-3 mb-6">
                            <div class="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded"></div>
                            <div class="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-4/5"></div>
                        </div>
                        <div class="h-4 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded mb-6"></div>
                        <div class="h-64 md:h-96 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg"></div>
                    </div>
                    
                    <!-- Content skeleton -->
                    <div class="space-y-4 mb-8">
                        {#each Array(8) as _}
                            <div class="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-full"></div>
                        {/each}
                        <div class="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        {:else if error}
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mb-4 h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="mb-2 text-xl font-semibold text-red-600">Error Loading Article</h2>
                <p class="text-muted-foreground mb-4">{error}</p>
                <Button onclick={loadArticle}>Try Again</Button>
            </div>
        {:else if article}
            <article class="max-w-4xl mx-auto animate-fade-in">
                <header class="mb-10">
                    <div class="flex flex-wrap items-center gap-3 mb-6">
                        <span class="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary capitalize border border-primary/20">
                            {article.category}
                        </span>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                            </svg>
                            <span class="font-medium">{article.source}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDate(article.published_at)}</span>
                        </div>
                    </div>
                    
                    <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6 text-foreground">{article.title}</h1>
                    
                    {#if article.author}
                        <div class="flex items-center gap-2 mb-8">
                            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span class="text-muted-foreground">By <span class="font-medium text-foreground">{article.author}</span></span>
                        </div>
                    {/if}
                    
                    {#if article.image_url}
                        <div class="relative overflow-hidden rounded-xl mb-8 shadow-lg">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                class="w-full h-64 md:h-96 object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    {/if}
                </header>

                <div class="prose prose-lg max-w-none mb-12 leading-relaxed">
                    <div class="article-content text-foreground/90 leading-8">
                        {@html article.content}
                    </div>
                </div>

                <!-- AI Summary Section -->
                <div class="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 mb-8 border border-primary/20">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-foreground">AI Summary</h3>
                        </div>
                        {#if !summary && !article.summary}
                            <Button 
                                onclick={generateSummary} 
                                disabled={isGeneratingSummary}
                                size="sm"
                                class="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                            >
                                {#if isGeneratingSummary}
                                    <svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Generating...
                                {:else}
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate Summary
                                {/if}
                            </Button>
                        {/if}
                    </div>
                    
                    {#if summary}
                        <div class="bg-card/50 p-4 rounded-lg border border-border/50">
                            <p class="text-foreground/80 leading-relaxed">{summary}</p>
                        </div>
                    {:else if article.summary}
                        <div class="bg-card/50 p-4 rounded-lg border border-border/50">
                            <p class="text-foreground/80 leading-relaxed">{article.summary}</p>
                        </div>
                    {:else}
                        <p class="text-muted-foreground text-sm">Click the button above to generate an AI-powered summary of this article.</p>
                    {/if}
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card/50 rounded-xl border border-border/50">
                    <Button 
                        variant="outline" 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 hover:bg-primary/5 hover:border-primary/20"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Read Original Article
                    </Button>
                    
                    <div class="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                            class="flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Share Article
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onclick={() => window.print()}
                            class="flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </Button>
                    </div>
                </div>
            </article>
        {/if}
    </main>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in {
        animation: fade-in 0.6s ease-out forwards;
    }
    
    /* Enhanced article content styling */
    :global(.article-content p) {
        margin-bottom: 1.5rem;
        line-height: 1.8;
    }
    
    :global(.article-content img) {
        border-radius: 0.75rem;
        margin: 2rem 0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    :global(.article-content h1, .article-content h2, .article-content h3) {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    :global(.article-content blockquote) {
        border-left: 4px solid hsl(var(--primary));
        padding-left: 1rem;
        margin: 1.5rem 0;
        font-style: italic;
        background: hsl(var(--muted) / 0.3);
        padding: 1rem;
        border-radius: 0.5rem;
    }
    
    /* Print styles */
    @media print {
        .sticky {
            position: static !important;
        }
        
        .no-print {
            display: none !important;
        }
    }
</style>