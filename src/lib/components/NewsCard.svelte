<script lang="ts">
    import type { NewsArticle } from '$lib/types/news';
    import { Button } from '$lib/components/ui/button';

    let { article }: { article: NewsArticle } = $props();

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
</script>

<article class="overflow-hidden rounded-lg border bg-card shadow-sm">
    {#if article.imageUrl}
        <img
            src={article.imageUrl}
            alt={article.title}
            class="h-48 w-full object-cover"
        />
    {/if}
    <div class="p-4">
        <p class="text-sm text-muted-foreground">{article.source} • {formatDate(article.publishedAt)}</p>
        <h2 class="mt-2 text-xl font-semibold">{article.title}</h2>
        <p class="mt-2 text-muted-foreground">{article.description}</p>
        <div class="mt-4 flex items-center justify-between">
            <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {article.category}
            </span>
            <Button variant="outline" size="sm" href={article.url}>Read More</Button>
        </div>
    </div>
</article>
