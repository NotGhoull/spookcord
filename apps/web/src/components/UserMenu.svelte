<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { queryClient } from '$lib/orpc';

	const sessionQuery = authClient.useSession();

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					queryClient.invalidateQueries();
					goto('/');
				},
				onError: (error) => {
					console.error('Sign out failed:', error);
				}
			}
		});
	}

	function goToLogin() {
		goto('/login');
	}
</script>

<div class="relative">
	{#if $sessionQuery.isPending}
		<div class="h-8 w-24 animate-pulse rounded bg-neutral-700"></div>
	{:else if $sessionQuery.data?.user}
		{@const user = $sessionQuery.data.user}
		<div class="flex items-center gap-3">
			<span class="hidden text-sm text-neutral-300 sm:inline" title={user.email}>
				{user.name || user.email?.split('@')[0] || 'User'}
			</span>
			<button
				onclick={handleSignOut}
				class="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
			>
				Sign Out
			</button>
		</div>
	{:else}
		<div class="flex items-center gap-2">
			<button
				onclick={goToLogin}
				class="rounded bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700"
			>
				Sign In
			</button>
		</div>
	{/if}
</div>
