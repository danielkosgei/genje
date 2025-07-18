<script lang="ts">
    let email = $state('');
    let isSubscribed = $state(false);
    let isLoading = $state(false);
    
    async function handleSubmit() {
        if (!email || isLoading) return;
        
        isLoading = true;
        
        // Simulate API call
        setTimeout(() => {
            isSubscribed = true;
            isLoading = false;
            email = '';
        }, 1500);
    }
    
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    }
</script>

<div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-xl border shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground">Stay Updated</h2>
    </div>
    
    {#if isSubscribed}
        <div class="text-center py-4">
            <div class="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 class="font-semibold text-foreground mb-1">Thanks for subscribing!</h3>
            <p class="text-sm text-muted-foreground">You'll receive our daily news digest.</p>
        </div>
    {:else}
        <div>
            <p class="text-sm text-muted-foreground mb-4">
                Get daily news updates delivered to your inbox. Stay informed with the latest from Kenya.
            </p>
            
            <div class="space-y-3">
                <input
                    type="email"
                    placeholder="Enter your email"
                    bind:value={email}
                    onkeypress={handleKeyPress}
                    class="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/50 dark:bg-black/20"
                />
                
                <button
                    onclick={handleSubmit}
                    disabled={!email || isLoading}
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {#if isLoading}
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Subscribing...
                    {:else}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Subscribe
                    {/if}
                </button>
            </div>
            
            <p class="text-xs text-muted-foreground mt-3 text-center">
                No spam, unsubscribe anytime
            </p>
        </div>
    {/if}
</div>