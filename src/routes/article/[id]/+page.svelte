<script lang="ts">
    import { page } from '$app/stores';
    import { newsAPI } from '$lib/api/news';
    import type { NewsArticle } from '$lib/types/news';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { stripHtml } from '$lib/utils/content';
    import ArticleEngagement from '$lib/components/ArticleEngagement.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let article = $state<NewsArticle | null>(data.article);
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    let summary = $state<string | null>(null);
    let isGeneratingSummary = $state(false);
    let showShareMenu = $state(false);

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

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    async function handleShare() {
        if (!article) return;
        
        const url = window.location.href;
        const title = article.title;
        
        // Use native sharing on mobile devices
        if (isMobileDevice() && navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                });
                return;
            } catch (error) {
                // Fall back to custom sharing if native sharing fails
                console.log('Native sharing failed, falling back to custom share');
            }
        }

        // For desktop, show the share menu dropdown
        showShareMenu = !showShareMenu;
    }

    function handleSharePlatform(platform: string) {
        if (!article) return;
        
        const url = window.location.href;
        const title = article.title;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                showShareMenu = false;
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        showShareMenu = false;
    }

    // Close share menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Element;
        if (!target.closest('.share-menu-container')) {
            showShareMenu = false;
        }
    }

    onMount(() => {
        loadArticle();
        
        // Add click outside listener for share menu
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
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
                        <div class="relative share-menu-container">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onclick={handleShare}
                                class="hidden sm:flex"
                            >
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                                Share
                            </Button>

                            <!-- Share dropdown menu -->
                            {#if showShareMenu}
                                <div class="absolute right-0 top-full mt-2 w-56 bg-card border rounded-lg shadow-lg z-50">
                                    <div class="p-3">
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-sm font-medium text-foreground">Share Article</span>
                                            <button
                                                class="text-muted-foreground hover:text-foreground p-1 rounded"
                                                onclick={() => showShareMenu = false}
                                            >
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div class="space-y-1">
                                            <button
                                                class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                                                onclick={() => handleSharePlatform('twitter')}
                                            >
                                                <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                </svg>
                                                Twitter
                                            </button>
                                            
                                            <button
                                                class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                                                onclick={() => handleSharePlatform('facebook')}
                                            >
                                                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                                Facebook
                                            </button>
                                            
                                            <button
                                                class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                                                onclick={() => handleSharePlatform('whatsapp')}
                                            >
                                                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                </svg>
                                                WhatsApp
                                            </button>
                                            
                                            <button
                                                class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                                                onclick={() => handleSharePlatform('copy')}
                                            >
                                                <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
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

                <!-- Engagement Section -->
                <div id="comments" class="mb-8">
                    <ArticleEngagement 
                        articleId={article.id.toString()}
                        user={data?.user}
                        initialLikes={Math.floor(Math.random() * 100) + 10}
                        initialBookmarked={false}
                        initialUserLiked={false}
                        showComments={true}
                        compact={false}
                    />
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col gap-4 p-4 sm:p-6 bg-card/50 rounded-xl border border-border/50">
                    <Button 
                        variant="outline" 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20 w-full"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Read Original Article
                    </Button>
                    
                    <div class="flex justify-center">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onclick={() => window.print()}
                            class="flex items-center justify-center gap-2"
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