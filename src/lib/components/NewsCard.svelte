<script lang="ts">
    import type { NewsArticle } from '$lib/types/news';
    import { Button } from '$lib/components/ui/button';
    import { extractDescription } from '$lib/utils/content';

    let { article }: { article: NewsArticle } = $props();

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getDescription(article: NewsArticle): string {
        if (article.summary && article.summary.trim()) {
            return article.summary;
        }
        return extractDescription(article.content, 180);
    }
</script>

<article class="group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
    {#if article.image_url}
        <div class="relative overflow-hidden">
            <img
                src={article.image_url}
                alt={article.title}
                class="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
    {/if}
    <div class="p-5">
        <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
                {article.category}
            </span>
            <div class="flex items-center text-xs text-muted-foreground">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {formatDate(article.published_at)}
            </div>
        </div>
        
        <a href="/article/{article.id}" class="block group/title">
            <h2 class="text-xl font-bold leading-tight text-foreground group-hover/title:text-primary transition-colors duration-200 line-clamp-2">
                {article.title}
            </h2>
        </a>
        
        <p class="mt-3 text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {getDescription(article)}
        </p>
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div class="flex items-center text-xs text-muted-foreground">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                {article.source}
            </div>
            <div class="flex gap-2">
                <Button variant="default" size="sm" href="/article/{article.id}" class="text-xs">
                    Read More
                </Button>
                <Button variant="ghost" size="sm" href={article.url} target="_blank" rel="noopener noreferrer" class="text-xs">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Source
                </Button>
            </div>
        </div>
    </div>
</article>
