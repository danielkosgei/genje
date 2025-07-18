<script lang="ts">
	import { Button } from '$lib/components/ui/button';
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
		<div class="max-w-4xl mx-auto">
			<!-- Profile Header -->
			<div class="bg-card rounded-xl border shadow-sm p-6 mb-8">
				<div class="flex items-center gap-4">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<div>
						<h2 class="text-2xl font-bold text-foreground">{data.user.username}</h2>
						<p class="text-muted-foreground">Member since {new Date().toLocaleDateString()}</p>
					</div>
				</div>
			</div>

			<div class="grid gap-8 lg:grid-cols-2">
				<!-- Reading Stats -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-foreground">Reading Statistics</h3>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div class="text-center p-4 bg-muted/30 rounded-lg">
							<div class="text-2xl font-bold text-foreground">0</div>
							<div class="text-sm text-muted-foreground">Articles Read</div>
						</div>
						<div class="text-center p-4 bg-muted/30 rounded-lg">
							<div class="text-2xl font-bold text-foreground">0</div>
							<div class="text-sm text-muted-foreground">Bookmarks</div>
						</div>
					</div>
				</div>

				<!-- Preferences -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-foreground">Preferences</h3>
					</div>
					
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-foreground">Email Notifications</div>
								<div class="text-sm text-muted-foreground">Receive daily news digest</div>
							</div>
							<input type="checkbox" class="rounded border-border" />
						</div>
						
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-foreground">Breaking News Alerts</div>
								<div class="text-sm text-muted-foreground">Get notified of urgent news</div>
							</div>
							<input type="checkbox" class="rounded border-border" />
						</div>
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-foreground">Quick Actions</h3>
					</div>
					
					<div class="space-y-3">
						<Button variant="outline" class="w-full justify-start" href="/bookmarks">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
							View Bookmarks
						</Button>
						
						<Button variant="outline" class="w-full justify-start" href="/reading-history">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Reading History
						</Button>
						
						<Button variant="outline" class="w-full justify-start text-red-600 hover:text-red-700" href="/auth/logout">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Sign Out
						</Button>
					</div>
				</div>

				<!-- Account Info -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-foreground">Account Information</h3>
					</div>
					
					<div class="space-y-3">
						<div>
							<div class="text-sm text-muted-foreground">Username</div>
							<div class="font-medium text-foreground">{data.user.username}</div>
						</div>
						
						<div>
							<div class="text-sm text-muted-foreground">User ID</div>
							<div class="font-mono text-sm text-foreground">{data.user.id}</div>
						</div>
						
						<div>
							<div class="text-sm text-muted-foreground">Account Status</div>
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
								<span class="text-sm font-medium text-green-600">Active</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>