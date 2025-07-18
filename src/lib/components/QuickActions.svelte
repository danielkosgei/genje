<script lang="ts">
    const quickActions = [
        {
            title: 'Breaking News',
            description: 'Latest urgent updates',
            icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'bg-red-500/10 text-red-600',
            action: () => {
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'breaking' }
                }));
            }
        },
        {
            title: 'Politics',
            description: 'Government & elections',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            color: 'bg-blue-500/10 text-blue-600',
            action: () => {
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'politics' }
                }));
            }
        },
        {
            title: 'Business',
            description: 'Economy & markets',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'bg-green-500/10 text-green-600',
            action: () => {
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'business' }
                }));
            }
        },
        {
            title: 'Sports',
            description: 'Games & competitions',
            icon: 'M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'bg-orange-500/10 text-orange-600',
            action: () => {
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'sports' }
                }));
            }
        }
    ];
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Quick Search</h2>
    </div>
    
    <div class="space-y-2">
        {#each quickActions as action}
            <button 
                onclick={action.action}
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group text-left"
            >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center {action.color}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                        {action.title}
                    </h3>
                    <p class="text-xs text-muted-foreground">
                        {action.description}
                    </p>
                </div>
                <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        {/each}
    </div>
</div>