<script lang="ts">
    import { onMount } from 'svelte';
    
    let isOpen = $state(false);
    let showButton = $state(false);
    
    const actions = [
        {
            label: 'Refresh News',
            icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => {
                window.location.reload();
            }
        },
        {
            label: 'Random Article',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: 'bg-purple-500 hover:bg-purple-600',
            action: () => {
                window.dispatchEvent(new CustomEvent('filterChange', { 
                    detail: { category: 'all', searchQuery: 'random' }
                }));
            }
        },
        {
            label: 'Share Site',
            icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z',
            color: 'bg-green-500 hover:bg-green-600',
            action: () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'Genje News - Kenyan News Aggregator',
                        text: 'Stay informed with the latest Kenyan news',
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(window.location.href);
                }
            }
        }
    ];
    
    function toggleMenu() {
        isOpen = !isOpen;
    }
    
    function handleAction(action: typeof actions[0]) {
        action.action();
        isOpen = false;
    }
    
    function handleScroll() {
        showButton = window.scrollY > 300;
    }
    
    onMount(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });
</script>

{#if showButton}
    <div class="fixed bottom-24 right-6 z-40 hidden xl:block">
        <!-- Action buttons -->
        {#if isOpen}
            <div class="flex flex-col gap-3 mb-4">
                {#each actions as action, index}
                    <button
                        onclick={() => handleAction(action)}
                        class="flex items-center gap-3 px-4 py-3 {action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                        style="animation-delay: {index * 100}ms"
                        title={action.label}
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
                        </svg>
                        <span class="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {action.label}
                        </span>
                    </button>
                {/each}
            </div>
        {/if}
        
        <!-- Main toggle button -->
        <button
            onclick={toggleMenu}
            class="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            aria-label="Quick actions menu"
        >
            <svg 
                class="w-6 h-6 transition-transform duration-300 {isOpen ? 'rotate-45' : ''}" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </button>
    </div>
{/if}

<style>
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .flex-col > button {
        animation: slideUp 0.3s ease-out forwards;
    }
</style>