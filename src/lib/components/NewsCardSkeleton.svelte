<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
    <div class="relative">
        <div class="h-48 w-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
    <div class="p-5">
        <div class="flex items-center gap-2 mb-3">
            <div class="h-6 w-16 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            <div class="h-3 w-20 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
        </div>
        
        <div class="space-y-2 mb-3">
            <div class="h-6 w-full rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            <div class="h-6 w-4/5 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
        </div>
        
        <div class="space-y-2 mb-4">
            <div class="h-4 w-full rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            <div class="h-4 w-full rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            <div class="h-4 w-3/4 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
        </div>
        
        <div class="flex items-center justify-between pt-4 border-t border-border/50">
            <div class="h-3 w-16 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            <div class="flex gap-2">
                <div class="h-8 w-20 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
                <div class="h-8 w-16 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse"></div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }
    
    .animate-shimmer {
        animation: shimmer 2s infinite;
    }
</style>
