<script lang="ts">
    import { onMount } from 'svelte';
    
    let currentTime = $state(new Date());
    let mounted = $state(false);
    
    function updateTime() {
        currentTime = new Date();
    }
    
    function formatTime(date: Date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
    
    function formatDate(date: Date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    onMount(() => {
        mounted = true;
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    });
</script>

<div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Local Time</h2>
    </div>
    
    {#if mounted}
        <div class="text-center">
            <div class="text-3xl font-mono font-bold text-foreground mb-2">
                {formatTime(currentTime)}
            </div>
            <div class="text-sm text-muted-foreground">
                {formatDate(currentTime)}
            </div>
            <div class="text-xs text-muted-foreground mt-2">
                Nairobi, Kenya (EAT)
            </div>
        </div>
    {:else}
        <div class="animate-pulse text-center">
            <div class="h-8 bg-purple-200/50 rounded mb-2"></div>
            <div class="h-4 bg-purple-200/50 rounded w-2/3 mx-auto"></div>
        </div>
    {/if}
</div>