<script lang="ts">
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { CurrentChannel, CurrentServer } from '$lib/localStates/chat';
	import { orpc } from '$lib/orpc';
	import { ChevronDown, Plus, MessageCircleOff } from '@lucide/svelte';
	import { ChannelListButton } from '@spookcord/ui';
	import { createQuery } from '@tanstack/svelte-query';
	import { derived } from 'svelte/store';
	import CreateChannelPopup from './CreateChannelPopup.svelte';
	import { subscribe } from '$lib/eventbus';
	import { onDestroy } from 'svelte';

	let channelCreationPopupOpen = $state(false);
	let channelCreationOwningName = $state('');
	let channelCreationOwningCategory = $state();

	let serverData = createQuery(
		derived(CurrentServer, ($CurrentServer) =>
			orpc.server.get.queryOptions({
				input: {
					id: $CurrentServer
				},
				staleTime: 1000 * 60 * 30 // stale after half an hour
			})
		)
	);

	let unsubscribe = subscribe('updateChannelList', () => {
		$serverData.refetch();
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if $serverData.isLoading}
		<p>Loading...</p>
	{:else if $serverData.isError || !$serverData.data?.success}
		<p>Something went wrong ({$serverData.error?.message ?? 'Unkown error'})</p>
	{:else if $serverData.data.response && $serverData.data.response.categories.length > 0}
		<!-- Header -->
		<div class="border-separator/20 flex h-16 items-center justify-between border-b px-4">
			<h2 class="grow truncate text-lg font-medium">{$serverData.data.response.name}</h2>
			<button
				class="hover:bg-button/50 hover:text-accent ml-2 rounded-lg p-2 transition-colors duration-200"
				><ChevronDown /></button
			>
		</div>

		<!-- Channels -->
		<ScrollArea class="h-full">
			{#each $serverData.data.response.categories as c (c.id)}
				<div class="mr-2 mb-5 ml-2">
					<div class="group mb-1 flex items-center px-1">
						<button
							class="text-muted group-hover:text-primary group flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
						>
							<ChevronDown class="h-4 w-4 transition-transform duration-200" />
							<span class="group-hover:text-primary transition-colors duration-200">{c.name}</span>
						</button>
						<button
							class="text-primary ml-auto cursor-pointer rounded-lg p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:opacity-100"
							onclick={() => {
								channelCreationPopupOpen = true;
								channelCreationOwningName = c.name;
								channelCreationOwningCategory = c.id;
							}}><Plus class="h-4 w-4" /></button
						>
					</div>

					<div class="space-y-2">
						{#each c.channels! as channel (channel.id)}
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

{#if channelCreationPopupOpen}
	<CreateChannelPopup
		bind:open={channelCreationPopupOpen}
		owningName={channelCreationOwningName}
		owningCatagory={channelCreationOwningCategory}
	/>
{/if}
