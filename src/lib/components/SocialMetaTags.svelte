<script lang="ts">
	// Props for the component
	interface Props {
		title: string;
		description: string;
		imageUrl: string;
		url: string;
		type?: string;
		siteName?: string;
		twitterCard?: string;
		twitterSite?: string;
	}

	let { 
		title, 
		description, 
		imageUrl, 
		url,
		type = 'article',
		siteName = 'Genje News',
		twitterCard = 'summary_large_image',
		twitterSite = '@genjenews'
	} = $props();
</script>

<!-- Open Graph Meta Tags -->
<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:site_name" content={siteName} />
	
	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:site" content={twitterSite} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	
	<!-- Additional Meta Tags for Articles -->
	{#if type === 'article'}
		<meta property="article:published_time" content={new Date().toISOString()} />
	{/if}
	
	<!-- Canonical URL -->
	<link rel="canonical" href={url} />
</svelte:head>