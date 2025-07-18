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
            label: 'Trending',
            icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            href: null,
            action: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'trending' }
                }));
            }
        },
        {
            label: 'Categories',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            href: null,
            action: () => {
                // Toggle category view - could expand to show category selector
                const categories = ['diaspora', 'kiswahili', 'news'];
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: randomCategory, searchQuery: '' }
                }));
            }
        },
        {
            label: 'Search',
            icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            href: null,
            action: () => {
                // Focus on search input
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
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