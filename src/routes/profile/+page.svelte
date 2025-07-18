<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import UserActivityDashboard from '$lib/components/UserActivityDashboard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Profile - Genje News</title>
	<meta name="description" content="Manage your Genje News profile and preferences." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
	<!-- Header -->
	<header class="border-b bg-card/50 backdrop-blur-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
						</svg>
					</div>
					<div>
						<h1 class="text-xl font-bold text-foreground">Genje News</h1>
						<p class="text-xs text-muted-foreground">Profile Settings</p>
					</div>
				</div>
				<Button variant="outline" href="/">
					← Back to News
				</Button>
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-8">
		<div class="max-w-6xl mx-auto">
			<!-- User Activity Dashboard -->
			<UserActivityDashboard user={data.user} />
		</div>
	</main>
</div>