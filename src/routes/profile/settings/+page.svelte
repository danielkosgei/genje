<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let preferences = $state({
		emailNotifications: 'weekly',
		pushNotifications: 'important',
		preferredLanguage: 'en',
		preferredCategories: [],
		theme: 'system',
		timezone: 'Africa/Nairobi'
	});

	let isLoading = $state(true);
	let isSaving = $state(false);
	let saveMessage = $state<string | null>(null);
	let error = $state<string | null>(null);

	const categories = [
		'Politics', 'Business', 'Sports', 'Technology', 'Health', 
		'Entertainment', 'Education', 'Environment', 'International'
	];

	const timezones = [
		{ value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
		{ value: 'Africa/Lagos', label: 'Lagos (WAT)' },
		{ value: 'Africa/Cairo', label: 'Cairo (EET)' },
		{ value: 'UTC', label: 'UTC' },
		{ value: 'Europe/London', label: 'London (GMT)' },
		{ value: 'America/New_York', label: 'New York (EST)' }
	];

	async function loadPreferences() {
		try {
			isLoading = true;
			const response = await fetch('/api/user/preferences');
			
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/auth/login';
					return;
				}
				throw new Error('Failed to load preferences');
			}

			const result = await response.json();
			if (result.success && result.data) {
				preferences = {
					...preferences,
					...result.data,
					preferredCategories: result.data.preferredCategories ? 
						JSON.parse(result.data.preferredCategories) : []
				};
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load preferences';
		} finally {
			isLoading = false;
		}
	}

	async function savePreferences() {
		try {
			isSaving = true;
			error = null;
			saveMessage = null;

			const response = await fetch('/api/user/preferences', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...preferences,
					preferredCategories: JSON.stringify(preferences.preferredCategories)
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save preferences');
			}

			const result = await response.json();
			if (result.success) {
				saveMessage = 'Preferences saved successfully!';
				setTimeout(() => saveMessage = null, 3000);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save preferences';
		} finally {
			isSaving = false;
		}
	}

	function toggleCategory(category: string) {
		if (preferences.preferredCategories.includes(category)) {
			preferences.preferredCategories = preferences.preferredCategories.filter(c => c !== category);
		} else {
			preferences.preferredCategories = [...preferences.preferredCategories, category];
		}
	}

	onMount(() => {
		loadPreferences();
	});
</script>

<svelte:head>
	<title>Settings - Genje News</title>
	<meta name="description" content="Manage your Genje News preferences and settings" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-4 mb-4">
				<a href="/profile" class="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to Profile
				</a>
			</div>
			
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<div>
					<h1 class="text-3xl font-bold text-foreground">Settings</h1>
					<p class="text-muted-foreground">Manage your preferences and account settings</p>
				</div>
			</div>
		</div>

		{#if isLoading}
			<div class="max-w-2xl mx-auto">
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<div class="animate-pulse space-y-6">
						{#each Array(5) as _}
							<div class="space-y-2">
								<div class="h-4 bg-muted rounded w-1/4"></div>
								<div class="h-10 bg-muted rounded"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="max-w-2xl mx-auto space-y-6">
				<!-- Notifications Settings -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
						<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.868 19.718A10.968 10.968 0 016.75 19h2.5A10.968 10.968 0 0112 20.25c1.357 0 2.637-.246 3.832-.677" />
						</svg>
						Notifications
					</h2>
					
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Email Notifications</label>
							<select bind:value={preferences.emailNotifications} class="w-full p-3 border border-border rounded-lg bg-background">
								<option value="none">None</option>
								<option value="daily">Daily digest</option>
								<option value="weekly">Weekly digest</option>
							</select>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Push Notifications</label>
							<select bind:value={preferences.pushNotifications} class="w-full p-3 border border-border rounded-lg bg-background">
								<option value="none">None</option>
								<option value="important">Important news only</option>
								<option value="all">All notifications</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Language & Region -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
						<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
						</svg>
						Language & Region
					</h2>
					
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Preferred Language</label>
							<select bind:value={preferences.preferredLanguage} class="w-full p-3 border border-border rounded-lg bg-background">
								<option value="en">English</option>
								<option value="sw">Kiswahili</option>
							</select>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Timezone</label>
							<select bind:value={preferences.timezone} class="w-full p-3 border border-border rounded-lg bg-background">
								{#each timezones as tz}
									<option value={tz.value}>{tz.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Content Preferences -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
						<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
						Content Preferences
					</h2>
					
					<div>
						<label class="block text-sm font-medium text-foreground mb-3">Preferred Categories</label>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
							{#each categories as category}
								<button
									onclick={() => toggleCategory(category)}
									class="p-3 text-sm rounded-lg border transition-colors {
										preferences.preferredCategories.includes(category)
											? 'bg-primary text-primary-foreground border-primary'
											: 'bg-background border-border hover:bg-muted'
									}"
								>
									{category}
								</button>
							{/each}
						</div>
						<p class="text-xs text-muted-foreground mt-2">
							Select categories you're most interested in to personalize your news feed
						</p>
					</div>
				</div>

				<!-- Appearance -->
				<div class="bg-card rounded-xl border shadow-sm p-6">
					<h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
						<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
						</svg>
						Appearance
					</h2>
					
					<div>
						<label class="block text-sm font-medium text-foreground mb-2">Theme</label>
						<select bind:value={preferences.theme} class="w-full p-3 border border-border rounded-lg bg-background">
							<option value="light">Light</option>
							<option value="dark">Dark</option>
							<option value="system">System (Auto)</option>
						</select>
					</div>
				</div>

				<!-- Save Button -->
				<div class="flex items-center justify-between">
					<div>
						{#if saveMessage}
							<div class="flex items-center gap-2 text-green-600">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								{saveMessage}
							</div>
						{/if}
						{#if error}
							<div class="flex items-center gap-2 text-red-600">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{error}
							</div>
						{/if}
					</div>
					
					<Button onclick={savePreferences} disabled={isSaving}>
						{#if isSaving}
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
							Saving...
						{:else}
							Save Preferences
						{/if}
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>