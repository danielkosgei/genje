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
</script>

<svelte:head>
  <title>{article.title} | Genje News</title>
  <meta name="description" content={article.summary} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content={articleUrl} />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.summary} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:site_name" content="Genje News" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@genjenews" />
  <meta name="twitter:title" content={article.title} />
  <meta name="twitter:description" content={article.summary} />
  <meta name="twitter:image" content={imageUrl} />
  
  <!-- Redirect to the actual article page after a short delay -->
  <meta http-equiv="refresh" content="0;url={articleUrl}" />
</svelte:head>

<div class="container mx-auto px-4 py-8 text-center">
  <h1 class="text-2xl font-bold mb-4">{article.title}</h1>
  
  {#if imageUrl}
    <img src={imageUrl} alt={article.title} class="mx-auto mb-4 max-w-full h-auto rounded-lg" />
  {/if}
  
  <p class="mb-4">{article.summary}</p>
  
  <p>Redirecting to article...</p>
  <a href={articleUrl} class="text-primary-600 hover:underline">Click here if you are not redirected automatically</a>
</div>