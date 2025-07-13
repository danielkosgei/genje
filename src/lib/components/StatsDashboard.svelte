<script lang="ts">
	import { Rss, Zap, Globe, Eye, TrendingUp, Users, Clock, Star } from '@lucide/svelte';

	interface StatItem {
		icon: any;
		label: string;
		value: number | string;
		change?: number;
		color: string;
		bgColor: string;
	}

	interface Props {
		stats: StatItem[];
		showAnimations?: boolean;
	}

	let { stats, showAnimations = true } = $props();
	let animatedValues = $state(stats.map(() => 0));

	// Animate counters on mount
	$effect(() => {
		if (showAnimations) {
			stats.forEach((stat: StatItem, index: number) => {
				const targetValue = typeof stat.value === 'number' ? stat.value : 0;
				animateCounter(index, targetValue);
			});
		}
	});

	function animateCounter(index: number, targetValue: number) {
		const duration = 2000;
		const steps = 60;
		const increment = targetValue / steps;
		let currentValue = 0;
		
		const timer = setInterval(() => {
			currentValue += increment;
			if (currentValue >= targetValue) {
				animatedValues[index] = targetValue;
				clearInterval(timer);
			} else {
				animatedValues[index] = Math.floor(currentValue);
			}
		}, duration / steps);
	}

	function formatNumber(value: number): string {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
		return value.toString();
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each stats as stat, index}
		<div class="card bg-surface-100 dark:bg-surface-800 p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 {stat.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
					<svelte:component this={stat.icon} size={24} class="text-white" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors">
						{stat.label}
					</p>
					<div class="flex items-center gap-2">
						<p class="text-2xl font-bold {stat.color}">
							{showAnimations ? formatNumber(animatedValues[index]) : (typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value)}
						</p>
						{#if stat.change !== undefined}
							<span class="text-xs {stat.change >= 0 ? 'text-success-600' : 'text-error-600'} flex items-center gap-1">
								<TrendingUp size={12} class={stat.change < 0 ? 'rotate-180' : ''} />
								{Math.abs(stat.change)}%
							</span>
						{/if}
					</div>
				</div>
			</div>
			
			<!-- Progress bar for some stats -->
			{#if stat.change !== undefined}
				<div class="mt-3">
					<div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1">
						<div 
							class="h-1 rounded-full transition-all duration-1000 {stat.change >= 0 ? 'bg-success-500' : 'bg-error-500'}"
							style="width: {Math.min(Math.abs(stat.change), 100)}%"
						></div>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div> 