<script lang="ts">
    import { onMount } from 'svelte';
    
    // Mock weather data for Nairobi (you can integrate with a real weather API later)
    let weather = $state({
        city: 'Nairobi',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: '⛅'
    });
    
    let isLoading = $state(true);
    
    onMount(() => {
        // Simulate loading
        setTimeout(() => {
            isLoading = false;
        }, 1000);
    });
</script>

<div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Weather</h2>
    </div>
    
    {#if isLoading}
        <div class="animate-pulse">
            <div class="h-8 bg-blue-200/50 rounded mb-2"></div>
            <div class="h-4 bg-blue-200/50 rounded w-2/3 mb-4"></div>
            <div class="grid grid-cols-2 gap-2">
                <div class="h-6 bg-blue-200/50 rounded"></div>
                <div class="h-6 bg-blue-200/50 rounded"></div>
            </div>
        </div>
    {:else}
        <div class="text-center mb-4">
            <div class="text-4xl mb-2">{weather.icon}</div>
            <div class="text-2xl font-bold text-foreground">{weather.temperature}°C</div>
            <div class="text-sm text-muted-foreground">{weather.condition}</div>
            <div class="text-xs text-muted-foreground mt-1">{weather.city}</div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div class="text-xs text-muted-foreground">Humidity</div>
                <div class="text-sm font-semibold text-foreground">{weather.humidity}%</div>
            </div>
            <div class="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div class="text-xs text-muted-foreground">Wind</div>
                <div class="text-sm font-semibold text-foreground">{weather.windSpeed} km/h</div>
            </div>
        </div>
    {/if}
</div>