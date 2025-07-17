<script>
  import { page } from '$app/stores';
  
  /** @type {import('./$types').PageData} */
  export let data;
  
  const { article } = data;
  const articleUrl = `${$page.url.origin}/article/${article.id}`;
  
  // Ensure image URL is absolute
  let imageUrl = article.image_url;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${$page.url.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
  
  // Extract a clean description from content if summary is not available
  let description = article.summary;
  if (!description && article.content) {
    // Remove HTML tags and limit to 160 characters
    description = article.content.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160) + '...';
  }
  
  // Format the published date
  let publishedDate = '';
  if (article.published_at) {
    const date = new Date(article.published_at);
    publishedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>{article.title || 'Article'} | Genje News</title>
  <meta name="description" content={description || 'Read this article on Genje News'} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content={articleUrl} />
  <meta property="og:title" content={article.title || 'Article'} />
  <meta property="og:description" content={description || 'Read this article on Genje News'} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:site_name" content="Genje News" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@genjenews" />
  <meta name="twitter:title" content={article.title || 'Article'} />
  <meta name="twitter:description" content={description || 'Read this article on Genje News'} />
  <meta name="twitter:image" content={imageUrl} />
  
  <!-- Additional Article Metadata -->
  {#if article.published_at}
    <meta property="article:published_time" content={article.published_at} />
  {/if}
  {#if article.author}
    <meta property="article:author" content={article.author} />
  {/if}
  {#if article.category}
    <meta property="article:section" content={article.category} />
  {/if}
  {#if article.tags && article.tags.length > 0}
    {#each article.tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}
  
  <!-- Redirect to the actual article page after a short delay -->
  <meta http-equiv="refresh" content="0;url={articleUrl}" />
</svelte:head>

<div class="container mx-auto px-4 py-8 text-center">
  <h1 class="text-2xl font-bold mb-4">{article.title || 'Article'}</h1>
  
  {#if article.author || publishedDate}
    <p class="text-surface-500 mb-4">
      {#if article.author}By {article.author}{/if}
      {#if article.author && publishedDate} • {/if}
      {#if publishedDate}{publishedDate}{/if}
    </p>
  {/if}
  
  {#if imageUrl}
    <img src={imageUrl} alt={article.title} class="mx-auto mb-4 max-w-full h-auto rounded-lg" />
  {/if}
  
  <p class="mb-4">{description || 'Read this article on Genje News'}</p>
  
  <p>Redirecting to article...</p>
  <a href={articleUrl} class="text-primary-600 hover:underline">Click here if you are not redirected automatically</a>
</div>