<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ServerButton from './ServerButton.svelte';
	import { orpc } from '$lib/orpc';
	import { createQuery } from '@tanstack/svelte-query';
	import { serverMembers } from '@spookcord/db-schema';

	const servers = createQuery<(typeof serverMembers)[]>(orpc.getUserServers.queryOptions());
</script>

<div class="flex h-full w-full min-w-24 flex-col py-3">
	<ScrollArea class="grow px-3">
		<div class="flex flex-col items-center space-y-3 pt-2">
			<ServerButton selfId={'HOME'} />
			<div class="relative mx-auto h-1 w-10 overflow-hidden rounded-full">
				<div class="bg-separator absolute inset-0 opacity-30"></div>
				<div class="bg-accent absolute inset-y-0 left-0 w-full animate-pulse opacity-30"></div>
			</div>
			{#if $servers.isLoading}
				<p>Loading...</p>
			{:else if $servers.isError}
				<p>An error occurred</p>
			{:else if $servers.data}
				{#each $servers.data as server (server.serverId)}
					<!-- Weird typescript hacks here -->
					<ServerButton selfId={(server.serverId as unknown as string) ?? 'ERROR!'} />
				{/each}
			{/if}
			<div class="bottom-0 left-1/5">
				<ServerButton selfId="+" isAddButton />
			</div>
		</div>
	</ScrollArea>
</div>
