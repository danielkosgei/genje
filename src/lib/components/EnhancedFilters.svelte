<script lang="ts">
	import { Filter, X, ChevronDown, Grid, List, Calendar, MapPin, Star } from '@lucide/svelte';

	interface FilterOption {
		value: string;
		label: string;
		count?: number;
		icon?: any;
	}

	interface Props {
		categories: FilterOption[];
		countries: FilterOption[];
		sources: FilterOption[];
		sortOptions: FilterOption[];
		selectedCategory: string;
		selectedCountry: string;
		selectedSource: string;
		sortBy: string;
		viewMode: 'grid' | 'list';
		onCategoryChange: (category: string) => void;
		onCountryChange: (country: string) => void;
		onSourceChange: (source: string) => void;
		onSortChange: (sort: string) => void;
		onViewModeChange: (mode: 'grid' | 'list') => void;
		showAdvancedFilters?: boolean;
	}

	let { 
		categories, 
		countries, 
		sources, 
		sortOptions,
		selectedCategory,
		selectedCountry,
		selectedSource,
		sortBy,
		viewMode,
		onCategoryChange,
		onCountryChange,
		onSourceChange,
		onSortChange,
		onViewModeChange,
		showAdvancedFilters = true
	} = $props();

	let showMobileFilters = $state(false);
	let activeDropdown = $state<string | null>(null);

	function toggleDropdown(dropdown: string) {
		activeDropdown = activeDropdown === dropdown ? null : dropdown;
	}

	function closeDropdowns() {
		activeDropdown = null;
	}

	// Close dropdowns when clicking outside
	function handleClickOutside(event: Event) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			closeDropdowns();
		}
	}
</script>

<div class="bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
	<div class="container mx-auto px-4 py-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<!-- Category Filters -->
			<div class="flex flex-wrap gap-2">
				{#each categories as category}
					<button
						class="btn btn-sm {selectedCategory === category.value ? 'variant-filled-primary' : 'variant-ghost-surface'} transition-all duration-200 hover:scale-105"
						onclick={() => onCategoryChange(category.value)}
					>
						{#if category.icon}
							<svelte:component this={category.icon} size={14} />
						{/if}
						<span class="ml-1">{category.label}</span>
						{#if category.count}
							<span class="badge variant-filled-surface text-xs ml-2">{category.count}</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Advanced Filters -->
			<div class="flex items-center gap-2">
				<!-- Country Filter -->
				<div class="dropdown-container relative">
					<button 
						class="btn btn-sm variant-ghost-surface flex items-center gap-2"
						onclick={() => toggleDropdown('country')}
					>
						<MapPin size={14} />
						<span>{selectedCountry === 'All' ? 'All Countries' : selectedCountry}</span>
						<ChevronDown size={14} class="transition-transform {activeDropdown === 'country' ? 'rotate-180' : ''}" />
					</button>
					
					{#if activeDropdown === 'country'}
						<div class="absolute top-full left-0 mt-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 min-w-48">
							{#each countries as country}
								<button 
									class="w-full text-left p-3 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-between {selectedCountry === country.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
									onclick={() => { onCountryChange(country.value); closeDropdowns(); }}
								>
									<span class="flex items-center gap-2">
										<MapPin size={14} />
										{country.label}
									</span>
									{#if country.count}
										<span class="text-xs text-surface-500">{country.count}</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Source Filter -->
				<div class="dropdown-container relative">
					<button 
						class="btn btn-sm variant-ghost-surface flex items-center gap-2"
						onclick={() => toggleDropdown('source')}
					>
						<Star size={14} />
						<span>{selectedSource === 'All' ? 'All Sources' : selectedSource}</span>
						<ChevronDown size={14} class="transition-transform {activeDropdown === 'source' ? 'rotate-180' : ''}" />
					</button>
					
					{#if activeDropdown === 'source'}
						<div class="absolute top-full left-0 mt-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto">
							{#each sources as source}
								<button 
									class="w-full text-left p-3 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-between {selectedSource === source.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
									onclick={() => { onSourceChange(source.value); closeDropdowns(); }}
								>
									<span class="flex items-center gap-2">
										<Star size={14} />
										{source.label}
									</span>
									{#if source.count}
										<span class="text-xs text-surface-500">{source.count}</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Sort Filter -->
				<div class="dropdown-container relative">
					<button 
						class="btn btn-sm variant-ghost-surface flex items-center gap-2"
						onclick={() => toggleDropdown('sort')}
					>
						<Calendar size={14} />
						<span>
							{#if sortBy === 'publishedAt'}
								Latest
							{:else if sortBy === 'views'}
								Most Viewed
							{:else if sortBy === 'likes'}
								Most Liked
							{:else}
								Sort By
							{/if}
						</span>
						<ChevronDown size={14} class="transition-transform {activeDropdown === 'sort' ? 'rotate-180' : ''}" />
					</button>
					
					{#if activeDropdown === 'sort'}
						<div class="absolute top-full left-0 mt-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 min-w-48">
							{#each sortOptions as option}
								<button 
									class="w-full text-left p-3 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors {sortBy === option.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
									onclick={() => { onSortChange(option.value); closeDropdowns(); }}
								>
									{option.label}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- View Mode Toggle -->
				<div class="flex items-center gap-1 bg-surface-200 dark:bg-surface-700 rounded-lg p-1">
					<button 
						class="p-2 rounded transition-colors {viewMode === 'grid' ? 'bg-surface-50 dark:bg-surface-600 text-primary-600' : 'text-surface-500'}"
						onclick={() => onViewModeChange('grid')}
						title="Grid View"
					>
						<Grid size={16} />
					</button>
					<button 
						class="p-2 rounded transition-colors {viewMode === 'list' ? 'bg-surface-50 dark:bg-surface-600 text-primary-600' : 'text-surface-500'}"
						onclick={() => onViewModeChange('list')}
						title="List View"
					>
						<List size={16} />
					</button>
				</div>

				<!-- Mobile Filter Toggle -->
				<button 
					class="btn btn-sm variant-ghost-surface lg:hidden"
					onclick={() => showMobileFilters = !showMobileFilters}
				>
					<Filter size={16} />
				</button>
			</div>
		</div>

		<!-- Mobile Filters -->
		{#if showMobileFilters}
			<div class="lg:hidden mt-4 p-4 bg-surface-50 dark:bg-surface-700 rounded-lg">
				<div class="space-y-4">
					<div>
						<label class="label">
							<span class="label-text">Country</span>
						</label>
						<select 
							class="select w-full" 
							bind:value={selectedCountry}
							onchange={() => onCountryChange(selectedCountry)}
						>
							{#each countries as country}
								<option value={country.value}>{country.label}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="label">
							<span class="label-text">Source</span>
						</label>
						<select 
							class="select w-full" 
							bind:value={selectedSource}
							onchange={() => onSourceChange(selectedSource)}
						>
							{#each sources as source}
								<option value={source.value}>{source.label}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="label">
							<span class="label-text">Sort By</span>
						</label>
						<select 
							class="select w-full" 
							bind:value={sortBy}
							onchange={() => onSortChange(sortBy)}
						>
							{#each sortOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div> 