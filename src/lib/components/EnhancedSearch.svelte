<script lang="ts">
	import { Search, Filter, X, TrendingUp, Clock, Star } from '@lucide/svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		value: string;
		placeholder?: string;
		onSearch?: (query: string) => void;
		onClear?: () => void;
		showFilters?: boolean;
		resultsCount?: number;
	}

	let { 
		value, 
		placeholder = "Search across all news sources...", 
		onSearch, 
		onClear, 
		showFilters = true,
		resultsCount = 0 
	} = $props();

	let isSearchFocused = $state(false);
	let showSuggestions = $state(false);
	let showFilterModal = $state(false);

	// Mock search suggestions
	const searchSuggestions = [
		'Breaking news',
		'Technology trends',
		'Climate change',
		'Space exploration',
		'Cryptocurrency',
		'AI developments',
		'Global economy',
		'Sports highlights'
	];

	// Mock recent searches
	const recentSearches = [
		'Bitcoin price',
		'NASA Mars mission',
		'Climate summit',
		'Tech stocks'
	];

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		onSearch?.(target.value);
	}

	function handleSuggestionClick(suggestion: string) {
		value = suggestion;
		onSearch?.(suggestion);
		showSuggestions = false;
	}

	function handleClear() {
		value = '';
		onClear?.();
	}

	function handleFocus() {
		isSearchFocused = true;
		showSuggestions = true;
	}

	function handleBlur() {
		isSearchFocused = false;
		// Delay hiding suggestions to allow for clicks
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}
</script>

<div class="relative w-full">
	<!-- Search Input -->
	<div class="relative">
		<Search 
			class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" 
			size={20} 
		/>
		<input
			type="text"
			{placeholder}
			bind:value
			oninput={handleSearch}
			onfocus={handleFocus}
			onblur={handleBlur}
			class="input pl-10 pr-12 w-full transition-all duration-200 {isSearchFocused ? 'ring-2 ring-primary-500' : ''}"
		/>
		
		<!-- Clear Button -->
		{#if value}
			<button 
				class="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
				onclick={handleClear}
			>
				<X size={16} />
			</button>
		{/if}
		
		<!-- Results Count -->
		{#if value && resultsCount > 0}
			<div class="absolute right-12 top-1/2 transform -translate-y-1/2">
				<span class="text-xs text-surface-400">{resultsCount} results</span>
			</div>
		{/if}
	</div>

	<!-- Search Suggestions Dropdown -->
	{#if showSuggestions && (value || isSearchFocused)}
		<div class="absolute top-full left-0 right-0 mt-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50">
			{#if value}
				<!-- Search Results Preview -->
				<div class="p-4 border-b border-surface-200 dark:border-surface-700">
					<div class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 mb-2">
						<Search size={14} />
						<span>Search for "{value}"</span>
					</div>
					<div class="space-y-2">
						{#each searchSuggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 3) as suggestion}
							<button 
								class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
								onclick={() => handleSuggestionClick(suggestion)}
							>
								<div class="flex items-center gap-2">
									<Search size={14} class="text-surface-400" />
									<span class="text-sm">{suggestion}</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Recent Searches -->
			<div class="p-4">
				<div class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 mb-2">
					<Clock size={14} />
					<span>Recent searches</span>
				</div>
				<div class="space-y-2">
					{#each recentSearches as search}
						<button 
							class="w-full text-left p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
							onclick={() => handleSuggestionClick(search)}
						>
							<div class="flex items-center gap-2">
								<Clock size={14} class="text-surface-400" />
								<span class="text-sm">{search}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Trending Searches -->
			<div class="p-4 border-t border-surface-200 dark:border-surface-700">
				<div class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 mb-2">
					<TrendingUp size={14} />
					<span>Trending</span>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each searchSuggestions.slice(0, 6) as suggestion}
						<button 
							class="badge variant-ghost-surface text-xs hover:variant-filled-primary transition-colors"
							onclick={() => handleSuggestionClick(suggestion)}
						>
							{suggestion}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Filter Modal -->
{#if showFilters && showFilterModal}
	<div class="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="card w-full max-w-md">
			<header class="card-header">
				<h3 class="h3">Advanced Search Filters</h3>
			</header>
			<section class="p-4 space-y-4">
				<div>
					<label class="label">
						<span class="label-text">Category</span>
					</label>
					<select class="select">
						<option value="">All Categories</option>
						<option value="technology">Technology</option>
						<option value="business">Business</option>
						<option value="politics">Politics</option>
						<option value="sports">Sports</option>
					</select>
				</div>
				
				<div>
					<label class="label">
						<span class="label-text">Date Range</span>
					</label>
					<select class="select">
						<option value="all">All Time</option>
						<option value="today">Today</option>
						<option value="week">This Week</option>
						<option value="month">This Month</option>
					</select>
				</div>
				
				<div>
					<label class="label">
						<span class="label-text">Source Trust Score</span>
					</label>
					<select class="select">
						<option value="">Any</option>
						<option value="95">95%+ (Highly Trusted)</option>
						<option value="85">85%+ (Trusted)</option>
						<option value="70">70%+ (Moderate)</option>
					</select>
				</div>
			</section>
			<footer class="card-footer">
				<button class="btn variant-ghost-surface" onclick={() => showFilterModal = false}>
					Cancel
				</button>
				<button class="btn variant-filled-primary" onclick={() => showFilterModal = false}>
					Apply Filters
				</button>
			</footer>
		</div>
	</div>
{/if} 