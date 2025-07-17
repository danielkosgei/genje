<script>
  export let data;
  
  // Destructure the metadata from the server
  const { metadata } = data;
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{metadata.title}</title>
  <meta name="description" content={metadata.description}>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content={metadata.url}>
  <meta property="og:title" content={metadata.title}>
  <meta property="og:description" content={metadata.description}>
  <meta property="og:image" content={metadata.image}>
  <meta property="og:site_name" content="Genje News">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@genjenews">
  <meta name="twitter:title" content={metadata.title}>
  <meta name="twitter:description" content={metadata.description}>
  <meta name="twitter:image" content={metadata.image}>
</svelte:head>

<slot />