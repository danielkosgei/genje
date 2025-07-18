<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	
	let isLoading = $state(false);
	let isRegisterMode = $state(false);
</script>

<svelte:head>
	<title>{isRegisterMode ? 'Register' : 'Login'} - Genje News</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-3 mb-4">
				<div class="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
					</svg>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">Genje News</h1>
					<p class="text-sm text-muted-foreground">Kenyan News Aggregator</p>
				</div>
			</div>
			<h2 class="text-xl font-semibold text-foreground">
				{isRegisterMode ? 'Create Account' : 'Welcome Back'}
			</h2>
			<p class="text-muted-foreground mt-1">
				{isRegisterMode ? 'Join Genje News to personalize your experience' : 'Sign in to your account'}
			</p>
		</div>

		<!-- Auth Form -->
		<div class="bg-card rounded-xl border shadow-sm p-6">
			<form 
				method="post" 
				action={isRegisterMode ? '?/register' : '?/login'}
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
			>
				<div class="space-y-4">
					<div>
						<label for="username" class="block text-sm font-medium text-foreground mb-2">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							class="w-full px-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
							placeholder="Enter your username"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-foreground mb-2">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							class="w-full px-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
							placeholder="Enter your password"
						/>
					</div>

					{#if form?.message}
						<div class="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p class="text-sm text-red-600">{form.message}</p>
						</div>
					{/if}

					<Button 
						type="submit" 
						class="w-full" 
						disabled={isLoading}
					>
						{#if isLoading}
							<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							{isRegisterMode ? 'Creating Account...' : 'Signing In...'}
						{:else}
							{isRegisterMode ? 'Create Account' : 'Sign In'}
						{/if}
					</Button>
				</div>
			</form>

			<!-- Toggle Mode -->
			<div class="mt-6 text-center">
				<p class="text-sm text-muted-foreground">
					{isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
					<button 
						type="button"
						onclick={() => isRegisterMode = !isRegisterMode}
						class="text-primary hover:text-primary/80 font-medium ml-1"
					>
						{isRegisterMode ? 'Sign In' : 'Create Account'}
					</button>
				</p>
			</div>

			<!-- Back to Home -->
			<div class="mt-4 text-center">
				<a href="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
					← Back to News
				</a>
			</div>
		</div>

		<!-- Features -->
		<div class="mt-8 text-center">
			<p class="text-sm text-muted-foreground mb-4">Join Genje News to unlock:</p>
			<div class="grid grid-cols-2 gap-4 text-xs">
				<div class="flex items-center gap-2 text-muted-foreground">
					<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Personalized feed
				</div>
				<div class="flex items-center gap-2 text-muted-foreground">
					<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Save articles
				</div>
				<div class="flex items-center gap-2 text-muted-foreground">
					<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Reading history
				</div>
				<div class="flex items-center gap-2 text-muted-foreground">
					<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Custom alerts
				</div>
			</div>
		</div>
	</div>
</div>