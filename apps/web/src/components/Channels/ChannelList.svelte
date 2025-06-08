<script lang="ts">
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { CurrentChannel, CurrentServer } from '$lib/localStates/chat';
	import { orpc } from '$lib/orpc';
	import { ChevronDown, Plus, MessageCircleOff } from '@lucide/svelte';
	import { category, channel, server, serverMembers } from '@spookcord/db-schema';
	import { ChannelListButton } from '@spookcord/ui';
	import { createQuery } from '@tanstack/svelte-query';
	import { derived } from 'svelte/store';

	let serverData = createQuery<
		unknown,
		Error,
		// Some typescript magic
		typeof server & {
			members: typeof serverMembers;
			categories: (typeof category)[] &
				{
					// Infered select, so we don't get weird typing issues
					channels: (typeof channel.$inferSelect)[];
				}[];
		}
	>(
		derived(CurrentServer, ($CurrentServer) =>
			orpc.server.get.queryOptions({
				input: {
					id: $CurrentServer
				},
				staleTime: 1000 * 60 * 30 // stale after half an hour
			})
		)
	);

	$inspect($serverData.data, console.warn);
</script>

<div class="flex h-full w-full flex-col">
	{#if $serverData.isLoading}
		<p>Loading...</p>
	{:else if $serverData.isError}
		<p>Something went wrong ({$serverData.error?.message ?? 'Unkown error'})</p>
	{:else if $serverData.data && $serverData.data.categories.length > 0}
		<!-- Header -->
		<div class="border-separator/20 flex h-16 items-center justify-between border-b px-4">
			<h2 class="grow truncate text-lg font-medium">{$serverData.data.name}</h2>
			<button
				class="hover:bg-button/50 hover:text-accent ml-2 rounded-lg p-2 transition-colors duration-200"
				><ChevronDown /></button
			>
		</div>

		<!-- Channels -->
		<ScrollArea class="h-full">
			{#each $serverData.data.categories as c (c.id)}
				<div class="mr-2 mb-5 ml-2">
					<div class="mb-1 flex items-center px-1">
						<button
							class="text-muted hover:text-foreground group flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
						>
							<ChevronDown class="h-4 w-4 transition-transform duration-200" />
							<span class="group-hover:text-accent transition-colors duration-200">{c.name}</span>
						</button>
						<button
							class="text-muted hover:text-accent ml-auto rounded-lg p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:opacity-100"
							><Plus class="h-4 w-4" /></button
						>
					</div>

					<div class="space-y-2">
						{#each c.channels as channel (channel.id)}
							<ChannelListButton
								name={channel.name}
								selected={$CurrentChannel == channel.id}
								onclick={() => {
									CurrentChannel.set(channel.id);
								}}
							/>
						{/each}
					</div>
				</div>
			{/each}
		</ScrollArea>
	{:else}
		<div class="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center">
			<MessageCircleOff class="h-15 w-15" />
			<p class="text-xl font-bold">No categories here</p>
			<p class="text-muted text-xs">This manor is most-likely corrupted or broken</p>
		</div>
	{/if}
</div>
