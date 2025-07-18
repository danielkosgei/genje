<script lang="ts">
    import { page } from '$app/stores';
    
    const navItems = [
        {
            label: 'Home',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            href: '/',
            action: null
        },
        {
            label: 'Diaspora',
            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            href: null,
            action: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'diaspora', searchQuery: '' }
                }));
            }
        },
        {
            label: 'Kiswahili',
            icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
            href: null,
            action: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'kiswahili', searchQuery: '' }
                }));
            }
        },
        {
            label: 'Profile',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            href: '/profile',
            action: null
        }
    ];
    
    function handleItemClick(item: typeof navItems[0]) {
        if (item.action) {
            item.action();
        }
    }
</script>

<!-- Mobile Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50 lg:hidden">
    <div class="flex items-center justify-around px-2 py-2">
        {#each navItems as item}
            {#if item.href}
                <a
                    href={item.href}
                    class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 {$page.url.pathname === item.href ? 'text-primary' : 'text-muted-foreground'}"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                    </svg>
                    <span class="text-xs font-medium">{item.label}</span>
                </a>
            {:else}
                <button
                    onclick={() => handleItemClick(item)}
                    class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                    </svg>
                    <span class="text-xs font-medium">{item.label}</span>
                </button>
            {/if}
        {/each}
    </div>
</nav>

<!-- Spacer to prevent content from being hidden behind bottom nav -->
<div class="h-20 lg:hidden"></div>