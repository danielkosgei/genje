<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import type { User } from '$lib/server/db/schema';
    
    let { user = null }: { user?: User | null } = $props();
    
    const categories = [
        'all',
        'diaspora',
        'kiswahili',
        'news'
    ] as const;

    let selectedCategory = $state('all');
    let searchQuery = $state('');
    let currentTime = $state(new Date());
    let mounted = $state(false);
    let showUserMenu = $state(false);

    function handleCategorySelect(category: string) {
        selectedCategory = category;
        dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category, searchQuery },
            bubbles: true 
        }));
    }

    function handleSearch() {
        dispatchEvent(new CustomEvent('filterChange', { 
            detail: { category: selectedCategory, searchQuery },
            bubbles: true 
        }));
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }

    function updateTime() {
        currentTime = new Date();
    }

    function formatTime(date: Date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function handleLogin() {
        window.location.href = '/auth/login';
    }

    function toggleUserMenu() {
        showUserMenu = !showUserMenu;
    }

    // Close user menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Element;
        if (!target.closest('.user-menu-container')) {
            showUserMenu = false;
        }
    }

    onMount(() => {
        mounted = true;
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<header class="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md shadow-sm">
    <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-foreground">Genje News</h1>
                    <p class="text-xs text-muted-foreground hidden sm:block">Kenyan News Aggregator</p>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <!-- Search Bar -->
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        placeholder="Search Kenyan news..."
                        class="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground"
                        bind:value={searchQuery}
                        onkeypress={handleKeyPress}
                        oninput={handleSearch}
                    />
                    {#if searchQuery}
                        <button 
                            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
                            onclick={() => { searchQuery = ''; handleSearch(); }}
                            aria-label="Clear search"
                        >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    {/if}
                </div>
                
                <!-- Local Time -->
                {#if mounted}
                    <div class="hidden lg:flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-sm font-mono font-medium text-foreground">
                            {formatTime(currentTime)}
                        </span>
                        <span class="text-xs text-muted-foreground">EAT</span>
                    </div>
                {/if}
                
                <!-- Auth Section -->
                {#if user}
                    <!-- User Menu -->
                    <div class="relative user-menu-container">
                        <button
                            onclick={toggleUserMenu}
                            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="hidden sm:block text-left">
                                <div class="text-sm font-medium text-foreground">{user.username}</div>
                                <div class="text-xs text-muted-foreground">Member</div>
                            </div>
                            <svg class="w-4 h-4 text-muted-foreground transition-transform {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {#if showUserMenu}
                            <div class="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                                <div class="p-3 border-b border-border">
                                    <div class="font-medium text-foreground">{user.username}</div>
                                    <div class="text-sm text-muted-foreground">Signed in</div>
                                </div>
                                
                                <div class="py-2">
                                    <a href="/profile" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </a>
                                    
                                    <a href="/bookmarks" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        Bookmarks
                                    </a>
                                    
                                    <a href="/reading-history" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Reading History
                                    </a>
                                    
                                    <a href="/settings" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </a>
                                </div>
                                
                                <div class="border-t border-border py-2">
                                    <a href="/auth/logout" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors w-full text-left text-red-600">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </a>
                                </div>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <!-- Login Button -->
                    <Button 
                        onclick={handleLogin}
                        variant="outline"
                        size="sm"
                        class="flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="hidden sm:inline">Login</span>
                    </Button>
                {/if}
            </div>
        </div>
        
        <div class="mt-6 flex flex-wrap gap-2">
            {#each categories as category}
                <button
                    class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 {selectedCategory === category 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}"
                    onclick={() => handleCategorySelect(category)}
                >
                    {#if category === 'all'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        All News
                    {:else if category === 'diaspora'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Diaspora
                    {:else if category === 'kiswahili'}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Kiswahili
                    {:else}
                        <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                        </svg>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</header>
