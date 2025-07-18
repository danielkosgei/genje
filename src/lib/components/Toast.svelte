<script lang="ts">
    import { onMount } from 'svelte';
    
    let { 
        message = '', 
        type = 'info', 
        duration = 3000,
        onClose = () => {}
    }: {
        message: string;
        type?: 'success' | 'error' | 'info' | 'warning';
        duration?: number;
        onClose?: () => void;
    } = $props();
    
    let visible = $state(true);
    
    function close() {
        visible = false;
        setTimeout(onClose, 300); // Wait for animation to complete
    }
    
    onMount(() => {
        if (duration > 0) {
            setTimeout(close, duration);
        }
    });
    
    const typeStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    const iconPaths = {
        success: 'M5 13l4 4L19 7',
        error: 'M6 18L18 6M6 6l12 12',
        warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z',
        info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
</script>

{#if visible}
    <div 
        class="fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 {visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}"
        role="alert"
    >
        <div class="flex items-center p-4 rounded-lg border shadow-lg {typeStyles[type]}">
            <div class="flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPaths[type]} />
                </svg>
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium">{message}</p>
            </div>
            <button 
                onclick={close}
                class="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-black/10 transition-colors"
                aria-label="Close notification"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
{/if}