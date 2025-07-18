<script lang="ts">
	interface ActivityStats {
		articlesRead: number;
		commentsPosted: number;
		articlesLiked: number;
		bookmarksSaved: number;
		readingStreak: number;
		favoriteCategory: string;
	}

	let { user }: { user: { id: string; username: string } } = $props();

	// Mock data - in real app, this would come from API
	let stats = $state<ActivityStats>({
		articlesRead: Math.floor(Math.random() * 100) + 20,
		commentsPosted: Math.floor(Math.random() * 50) + 5,
		articlesLiked: Math.floor(Math.random() * 80) + 10,
		bookmarksSaved: Math.floor(Math.random() * 30) + 3,
		readingStreak: Math.floor(Math.random() * 15) + 1,
		favoriteCategory: ['Politics', 'Business', 'Sports', 'Technology'][Math.floor(Math.random() * 4)]
	});

	let achievements = $state([
		{ 
			name: 'News Enthusiast', 
			description: 'Read 50+ articles', 
			earned: stats.articlesRead >= 50,
			icon: '📚'
		},
		{ 
			name: 'Active Commenter', 
			description: 'Posted 20+ comments', 
			earned: stats.commentsPosted >= 20,
			icon: '💬'
		},
		{ 
			name: 'Curator', 
			description: 'Saved 15+ bookmarks', 
			earned: stats.bookmarksSaved >= 15,
			icon: '🔖'
		},
		{ 
			name: 'Streak Master', 
			description: 'Read news for 7+ days straight', 
			earned: stats.readingStreak >= 7,
			icon: '🔥'
		}
	]);
</script>

<div class="bg-card rounded-xl border shadow-sm p-6">
	<div class="flex items-center gap-3 mb-6">
		<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
			{user.username.charAt(0).toUpperCase()}
		</div>
		<div>
			<h2 class="text-xl font-bold text-foreground">Your Activity</h2>
			<p class="text-sm text-muted-foreground">Welcome back, {user.username}!</p>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
		<div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				<span class="text-sm font-medium text-blue-800">Articles Read</span>
			</div>
			<p class="text-2xl font-bold text-blue-900">{stats.articlesRead}</p>
		</div>

		<div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v0M7 20l-2-2v-8a2 2 0 012-2h2.5" />
				</svg>
				<span class="text-sm font-medium text-green-800">Articles Liked</span>
			</div>
			<p class="text-2xl font-bold text-green-900">{stats.articlesLiked}</p>
		</div>

		<div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
				</svg>
				<span class="text-sm font-medium text-purple-800">Comments</span>
			</div>
			<p class="text-2xl font-bold text-purple-900">{stats.commentsPosted}</p>
		</div>

		<div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
				</svg>
				<span class="text-sm font-medium text-yellow-800">Bookmarks</span>
			</div>
			<p class="text-2xl font-bold text-yellow-900">{stats.bookmarksSaved}</p>
		</div>

		<div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
				</svg>
				<span class="text-sm font-medium text-red-800">Reading Streak</span>
			</div>
			<p class="text-2xl font-bold text-red-900">{stats.readingStreak} days</p>
		</div>

		<div class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
			<div class="flex items-center gap-2 mb-2">
				<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
				<span class="text-sm font-medium text-indigo-800">Favorite Topic</span>
			</div>
			<p class="text-lg font-bold text-indigo-900">{stats.favoriteCategory}</p>
		</div>
	</div>

	<!-- Achievements -->
	<div>
		<h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
			<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
			</svg>
			Achievements
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			{#each achievements as achievement}
				<div class="flex items-center gap-3 p-3 rounded-lg border {achievement.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'}">
					<div class="text-2xl {achievement.earned ? 'grayscale-0' : 'grayscale opacity-50'}">
						{achievement.icon}
					</div>
					<div class="flex-1">
						<h4 class="font-medium text-foreground {achievement.earned ? '' : 'opacity-60'}">{achievement.name}</h4>
						<p class="text-sm text-muted-foreground">{achievement.description}</p>
					</div>
					{#if achievement.earned}
						<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mt-6 pt-6 border-t border-border">
		<div class="flex flex-wrap gap-3">
			<a href="/bookmarks" class="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
				</svg>
				View Bookmarks
			</a>
			<a href="/reading-history" class="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Reading History
			</a>
			<a href="/settings" class="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				Settings
			</a>
		</div>
	</div>
</div>