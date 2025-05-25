<script>
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { onMount } from 'svelte';
	import ServerButton from './ServerButton.svelte';
	import { orpc } from '$lib/orpc';

	let servers = $state();

	onMount(async () => {
		await orpc.getUserById.call({}).then((data) => {
			if (!data) {
				return;
			}

			servers = data?.serverMemberships.sort((a, b) => {
				// Ensure correct sorting; `getTime()` should return a number
				return a.joinedAt.getTime() - b.joinedAt.getTime();
			});

			console.log('User belongs to ', servers);
		});
	});
</script>

<div class="flex h-full w-full min-w-24 flex-col py-3">
	<ScrollArea class="grow px-3">
		<div class="flex flex-col items-center space-y-3 pt-2">
			<ServerButton selfId={'HOME'} />
			<div class="relative mx-auto h-1 w-10 overflow-hidden rounded-full">
				<div class="bg-separator absolute inset-0 opacity-30"></div>
				<div class="bg-accent absolute inset-y-0 left-0 w-full animate-pulse opacity-30"></div>
			</div>

			{#each servers as server (server.serverId)}
				<ServerButton selfId={server.serverId ?? 'ERROR!'} />
			{/each}
			<div class="bottom-0 left-1/5">
				<ServerButton selfId="+" isAddButton />
			</div>
		</div>
	</ScrollArea>
</div>
