<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	interface SearchProps {
		searchQuery: string;
		onSearch: (query: string) => void;
		placeholder?: string;
	}

	let { 
		searchQuery = $bindable(''), 
		onSearch,
		placeholder = "Search Kenyan news..."
	}: SearchProps = $props();

	let showSuggestions = $state(false);
	let searchHistory = $state<string[]>([]);
	let suggestions = $state<string[]>([]);
	let popularSearches = $state<string[]>([]);
	let isLoading = $state(false);
	let searchInput: HTMLInputElement;
	let selectedSuggestionIndex = $state(-1);

	// Load search history and popular searches
	onMount(async () => {
		// Load search history from localStorage
		const saved = localStorage.getItem('genje-search-history');
		if (saved) {
			try {
				searchHistory = JSON.parse(saved);
			} catch (e) {
				console.error('Failed to parse search history:', e);
			}
		}

		// Load popular searches from API
		await loadPopularSearches();
	});

	async function loadPopularSearches() {
		try {
			isLoading = true;
			const response = await fetch('/api/search/popular');
			if (response.ok) {
				const data = await response.json();
				popularSearches = data.searches || [];
			} else {
				// Fallback to some default searches if API fails
				popularSearches = [
					'Breaking news Kenya',
					'Nairobi updates',
					'Kenya politics',
					'Business news',
					'Sports Kenya'
				];
			}
		} catch (error) {
			console.error('Failed to load popular searches:', error);
			// Fallback searches
			popularSearches = [
				'Breaking news Kenya',
				'Nairobi updates', 
				'Kenya politics',
				'Business news',
				'Sports Kenya'
			];
		} finally {
			isLoading = false;
		}
	}

	async function trackSearch(query: string) {
		try {
			await fetch('/api/search/track', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					query: query.trim(),
					timestamp: new Date().toISOString()
				}),
			});
		} catch (error) {
			console.error('Failed to track search:', error);
			// Don't block user experience if tracking fails
		}
	}

	function saveSearchHistory(query: string) {
		if (!query.trim() || searchHistory.includes(query)) return;
		
		searchHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
		localStorage.setItem('genje-search-history', JSON.stringify(searchHistory));
	}

	function clearSearchHistory() {
		searchHistory = [];
		localStorage.removeItem('genje-search-history');
	}

	function generateSuggestions(query: string) {
		if (!query.trim()) {
			suggestions = searchHistory.length > 0 ? searchHistory : popularSearches.slice(0, 6);
			return;
		}

		const filtered = [
			...searchHistory.filter(item => 
				item.toLowerCase().includes(query.toLowerCase())
			),
			...popularSearches.filter(item => 
				item.toLowerCase().includes(query.toLowerCase()) && 
				!searchHistory.includes(item)
			)
		].slice(0, 8);

		suggestions = filtered;
	}

	function handleInput() {
		generateSuggestions(searchQuery);
		showSuggestions = true;
		selectedSuggestionIndex = -1;
		
		// Debounced search for real-time results
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			if (searchQuery.trim()) {
				onSearch(searchQuery);
			}
		}, 300);
	}

	let searchTimeout: number;

	function handleKeyDown(event: KeyboardEvent) {
		if (!showSuggestions) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedSuggestionIndex >= 0) {
					selectSuggestion(suggestions[selectedSuggestionIndex]);
				} else {
					handleSearch();
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedSuggestionIndex = -1;
				searchInput.blur();
				break;
		}
	}

	async function handleSearch() {
		if (!searchQuery.trim()) return;
		
		saveSearchHistory(searchQuery);
		// Track the search for analytics
		await trackSearch(searchQuery);
		onSearch(searchQuery);
		showSuggestions = false;
		selectedSuggestionIndex = -1;
		searchInput.blur();
	}

	async function selectSuggestion(suggestion: string) {
		searchQuery = suggestion;
		await handleSearch();
	}

	function clearSearch() {
		searchQuery = '';
		onSearch('');
		showSuggestions = false;
		searchInput.focus();
	}

	function handleFocus() {
		generateSuggestions(searchQuery);
		showSuggestions = true;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.search-container')) {
			showSuggestions = false;
			selectedSuggestionIndex = -1;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="relative search-container">
	<div class="relative group">
		<!-- Search Icon -->
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
			<svg class="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>

		<!-- Search Input -->
		<input
			bind:this={searchInput}
			type="search"
			{placeholder}
			class="w-full sm:w-64 md:w-80 pl-10 pr-12 py-2.5 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground {showSuggestions ? 'rounded-b-none border-b-0' : ''}"
			bind:value={searchQuery}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onfocus={handleFocus}
			autocomplete="off"
			spellcheck="false"
		/>

		<!-- Clear Button -->
		{#if searchQuery}
			<button 
				class="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
				onclick={clearSearch}
				aria-label="Clear search"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}

		<!-- Search Button -->
		<button
			class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
			onclick={handleSearch}
			aria-label="Search"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
			</svg>
		</button>
	</div>

	<!-- Search Suggestions Dropdown -->
	{#if showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)}
		<div class="absolute top-full left-0 right-0 bg-card border border-t-0 border-border rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto">
			{#if searchQuery.trim() === '' && searchHistory.length > 0}
				<!-- Recent Searches Header -->
				<div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-sm font-medium text-foreground">Recent Searches</span>
					</div>
					<button
						class="text-xs text-muted-foreground hover:text-foreground transition-colors"
						onclick={clearSearchHistory}
					>
						Clear All
					</button>
				</div>
			{:else if searchQuery.trim() === ''}
				<!-- Popular Searches Header -->
				<div class="px-4 py-2 border-b border-border bg-muted/30">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
						<span class="text-sm font-medium text-foreground">Popular Searches</span>
					</div>
				</div>
			{/if}

			<!-- Suggestions List -->
			<div class="py-2">
				{#each suggestions as suggestion, index}
					<button
						class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors {selectedSuggestionIndex === index ? 'bg-muted/50' : ''}"
						onclick={() => selectSuggestion(suggestion)}
					>
						{#if searchHistory.includes(suggestion)}
							<svg class="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else}
							<svg class="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
						{/if}
						<span class="text-sm text-foreground">{suggestion}</span>
						{#if searchQuery.trim() && suggestion.toLowerCase().includes(searchQuery.toLowerCase())}
							<span class="ml-auto text-xs text-muted-foreground">Press Enter</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Search Tips -->
			{#if searchQuery.trim() && suggestions.length === 0}
				<div class="px-4 py-6 text-center">
					<svg class="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<p class="text-sm text-muted-foreground mb-2">No suggestions found</p>
					<p class="text-xs text-muted-foreground">Try searching for news topics, locations, or people</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Hide default search input clear button */
	input[type="search"]::-webkit-search-cancel-button {
		display: none;
	}
</style>