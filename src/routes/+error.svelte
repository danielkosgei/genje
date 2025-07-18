<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	let { status = 404, message = 'Page not found' } = $props();
</script>

<svelte:head>
	<title>{status} - {message} | Genje News</title>
	<meta name="description" content="Page not found on Genje News." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-md mx-auto text-center">
			<!-- Error Icon -->
			<div class="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
				<svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.562M15 17H9v-2.5A5.002 5.002 0 019.9 9.09l.1-.09a5 5 0 011 9.9V17z" />
				</svg>
			</div>

			<!-- Error Content -->
			<div class="bg-card rounded-xl border shadow-sm p-8">
				<h1 class="text-6xl font-bold text-primary mb-4">{status}</h1>
				<h2 class="text-xl font-semibold text-foreground mb-3">
					{#if status === 404}
						Page Not Found
					{:else if status === 500}
						Server Error
					{:else}
						Something Went Wrong
					{/if}
				</h2>
				<p class="text-muted-foreground mb-6">
					{#if status === 404}
						The page you're looking for doesn't exist or has been moved. Let's get you back to reading the news.
					{:else if status === 500}
						We're experiencing some technical difficulties. Our team has been notified and is working on a fix.
					{:else}
						{message}
					{/if}
				</p>

				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-3 justify-center">
					<Button href="/" class="w-full sm:w-auto">
						← Back to Home
					</Button>
					<Button variant="outline" onclick="history.back()" class="w-full sm:w-auto">
						Go Back
					</Button>
				</div>
			</div>

			<!-- Additional Help -->
			<div class="mt-8 text-center">
				<p class="text-sm text-muted-foreground mb-4">
					Still having trouble? Here are some helpful links:
				</p>
				<div class="flex flex-wrap justify-center gap-4 text-sm">
					<a href="/" class="text-primary hover:underline">Latest News</a>
					<a href="/profile" class="text-primary hover:underline">Your Profile</a>
					<a href="/bookmarks" class="text-primary hover:underline">Bookmarks</a>
					<a href="/settings" class="text-primary hover:underline">Settings</a>
				</div>
			</div>
		</div>
	</div>
</div>