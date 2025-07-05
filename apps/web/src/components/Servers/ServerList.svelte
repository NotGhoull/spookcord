<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ServerButton from './ServerButton.svelte';
	import { orpc, queryClient } from '$lib/orpc';
	import { createQuery } from '@tanstack/svelte-query';
	import { onDestroy } from 'svelte';
	import { subscribe } from '$lib/eventbus';

	const servers = createQuery(orpc.me.get.queryOptions());
	const unsubscribe = subscribe('updateManorList', (_) => {
		// TODO: Eventually, we'd want to optimistically update, but this works for now
		//       we'd probably want to make it into a realtime table though, so we can handle kicks and stuff properly
		queryClient.refetchQueries({
			queryKey: orpc.me.get.queryOptions().queryKey
		});
		console.log('Refetch called!');
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="flex h-full w-full min-w-24 flex-col py-3">
	<ScrollArea class="grow px-3">
		<div class="flex flex-col items-center space-y-3 pt-2">
			<ServerButton selfId={'HOME'} />
			<div class="relative mx-auto h-1 w-10 overflow-hidden rounded-full">
				<div class="bg-separator absolute inset-0 opacity-30"></div>
				<div class="bg-primary absolute inset-y-0 left-0 w-full animate-pulse opacity-30"></div>
			</div>
			{#if $servers.isLoading}
				<p>Loading...</p>
			{:else if $servers.isError || $servers.data?.error}
				<p>An error occurred</p>
				<p>${$servers.data?.error?.message ?? $servers.error?.message}</p>
			{:else if $servers.data}
				{#each $servers.data.response!.serverMemberships as server (server.serverId)}
					<ServerButton selfId={server.serverId ?? 'ERROR!'} />
				{/each}
			{/if}
			<div class="bottom-0 left-1/5">
				<ServerButton selfId="+" isAddButton />
			</div>
		</div>
	</ScrollArea>
</div>
