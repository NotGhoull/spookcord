<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { CurrentServer } from '$lib/localStates/chat';
	import { orpc } from '$lib/orpc';
	import { Search, Shield } from '@lucide/svelte';
	import type { server, serverMembers, user } from '@spookcord/db-schema';
	import { createQuery } from '@tanstack/svelte-query';
	import { derived } from 'svelte/store';

	let members = createQuery(
		derived(CurrentServer, ($CurrentServer) =>
			orpc.server.get.queryOptions({ input: { id: $CurrentServer } })
		)
	);

	let roles = $state([
		{
			id: 'default',
			name: 'Default',
			color: '#ff6b00'
		}
	]);

	let search = $state('');
</script>

<div class="flex h-full w-full flex-col">
	<div class="p-3">
		<div class="relative">
			<Search class="text-muted absolute top-2.5 left-3 size-2.5 h-4 w-4" />
			<Input
				placeholder="Search spirits"
				bind:value={search}
				class="border-separator/10 bg-input-bg/50 text-foreground placeholder:text-muted focus-visible:ring-accent/50 focus-visible:border-accent/50 rounded-xl pl-9 text-sm focus-visible:ring-1"
			/>
		</div>
	</div>

	<ScrollArea class="flex-1 px-3">
		{#if $members.isLoading}
			<p>Loading members...</p>
		{:else if $members.isError || !$members.data?.success}
			<p class="text-red-500">{$members.error?.message || $members.data!.error!.message}</p>
		{:else if roles.length > 0}
			<!-- TODO: Add proper role checking -->
			{#each roles as role (role.id)}
				<div class="mb-1 px-2">
					<h3 class="text-xs font-semibold" style:color={role.color}>
						{role.name} — {$members.data.response!.members.length}
					</h3>
				</div>

				<div class="space-y-1">
					{#each $members.data.response!.members as member (member.id)}
						<button
							class="group hover:bg-button/50 flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
						>
							<div
								class="relative h-10 w-10 shrink-0 scale-100 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
							>
								<div
									class="absolute inset-0 flex items-center justify-center text-lg"
									style:background-color={role.color}
								>
									<p>{member.user.name.slice(0, 2)}</p>
								</div>
							</div>
							<div class="flex flex-col items-start overflow-hidden text-left">
								<div class="flex gap-1">
									<span class="w-full truncate font-medium transition-colors duration-200">
										{member.user.name}
									</span>
									<!-- {#each member.badges as badge (badge.id)}
										{#if badge.id === 'developer'}
											<Shield />
										{:else if badge.id === 'admin'}{/if}
									{/each} -->
								</div>
								<!-- {#if member.statusText} -->
								<span class="text-muted w-full truncate text-xs">Default status</span>
								<!-- {/if} -->
							</div>
						</button>
					{/each}
				</div>
			{/each}
		{:else}
			<p>No spirits found.</p>
		{/if}
	</ScrollArea>
</div>
