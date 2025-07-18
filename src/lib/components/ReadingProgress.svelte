<script lang="ts">
    import { onMount } from 'svelte';
    
    let readingStats = $state({
        articlesRead: 0,
        timeSpent: 0,
        streak: 0,
        favoriteCategory: 'News'
    });
    
    let isLoading = $state(true);
    
    // Simulate reading progress (in a real app, this would come from user data/localStorage)
    function loadReadingStats() {
        // Check localStorage for existing stats
        const stored = localStorage.getItem('genje-reading-stats');
        if (stored) {
            readingStats = JSON.parse(stored);
        } else {
            // Generate some sample data for demo
            readingStats = {
                articlesRead: Math.floor(Math.random() * 50) + 10,
                timeSpent: Math.floor(Math.random() * 120) + 30, // minutes
                streak: Math.floor(Math.random() * 7) + 1,
                favoriteCategory: ['Politics', 'Business', 'Sports', 'Technology'][Math.floor(Math.random() * 4)]
            };
            localStorage.setItem('genje-reading-stats', JSON.stringify(readingStats));
        }
        isLoading = false;
    }
    
    function formatTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
    
    onMount(() => {
        setTimeout(loadReadingStats, 600);
    });
</script>

<div class="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50 rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Your Reading</h2>
    </div>
    
    {#if isLoading}
        <div class="animate-pulse">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="h-12 bg-violet-200/50 rounded-lg"></div>
                <div class="h-12 bg-violet-200/50 rounded-lg"></div>
            </div>
            <div class="h-8 bg-violet-200/50 rounded-lg"></div>
        </div>
    {:else}
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div class="text-2xl font-bold text-violet-600">{readingStats.articlesRead}</div>
                    <div class="text-xs text-muted-foreground">Articles Read</div>
                </div>
                
                <div class="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div class="text-2xl font-bold text-violet-600">{formatTime(readingStats.timeSpent)}</div>
                    <div class="text-xs text-muted-foreground">Time Spent</div>
                </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-foreground">{readingStats.streak} day streak</div>
                        <div class="text-xs text-muted-foreground">Keep it up!</div>
                    </div>
                </div>
                
                <div class="text-right">
                    <div class="text-xs text-muted-foreground">Favorite</div>
                    <div class="text-sm font-medium text-foreground">{readingStats.favoriteCategory}</div>
                </div>
            </div>
        </div>
    {/if}
</div>