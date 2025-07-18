<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>Login - Genje News</title>
	<meta name="description" content="Login to your Genje News account to access personalized features." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-3 mb-4">
				<div class="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-foreground">Genje News</h1>
			</div>
			<h2 class="text-xl font-semibold text-foreground mb-2">Welcome back</h2>
			<p class="text-muted-foreground">Sign in to access your personalized news experience</p>
		</div>

		<!-- Login Form -->
		<div class="bg-card rounded-xl border shadow-sm p-6">
			<form 
				method="post" 
				action="?/login" 
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
				class="space-y-4"
			>
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

				<div class="space-y-3">
					<Button 
						type="submit" 
						class="w-full" 
						disabled={isLoading}
					>
						{#if isLoading}
							<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Signing in...
						{:else}
							Sign In
						{/if}
					</Button>

					<Button 
						type="submit" 
						formaction="?/register"
						variant="outline" 
						class="w-full"
						disabled={isLoading}
					>
						Create Account
					</Button>
				</div>
			</form>

			<div class="mt-6 pt-6 border-t border-border/50">
				<div class="text-center">
					<a href="/" class="text-sm text-primary hover:text-primary/80 transition-colors">
						← Back to News
					</a>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8 text-sm text-muted-foreground">
			<p>By signing in, you agree to our terms of service and privacy policy.</p>
		</div>
	</div>
</div>