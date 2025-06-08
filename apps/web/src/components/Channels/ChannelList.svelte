<script lang="ts">
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { CurrentChannel, CurrentServer } from '$lib/localStates/chat';
	import { orpc } from '$lib/orpc';
	import { ChevronDown, HashIcon, Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { category, channel, server } from '@spookcord/db-schema';
	import { ChannelListButton } from '@spookcord/ui';
	import { type InferSelectModel } from 'drizzle-orm';

	let fullData:
		| (InferSelectModel<typeof category> & {
				channels: InferSelectModel<typeof channel>[];
				server: InferSelectModel<typeof server>;
		  })[]
		| undefined = $state();
	let serverName = $state('Unknown');
	let canSend = $state(false);

	CurrentServer.subscribe(async (a) => {
		if (canSend) {
			await getData(a);
		}
	});

	$effect(() => {
		async function get() {
			getData($CurrentServer);
		}
		get();
	});

	onMount(async () => {
		await getData($CurrentServer);
		canSend = true;
	});

	async function getData(server: string) {
		console.log('[DEBUG] Getting info for server! ', server);
		await orpc.getServerById.call({ id: server }).then((data) => {
			if (!data) {
				return;
			}
			serverName = data.name;
		});

		await orpc.getChannelsForServerById
			.call({ id: server })
			.then((data) => {
				console.log('Got server info: ', data);

				if (typeof data == 'undefined') {
					console.warn('NO DATA! ', server);
				}

				fullData = data;
			})
			.catch((err) => {
				console.warn('FAILED TO FETCH ', err);
			});
	}
</script>

<div class="flex h-full w-full flex-col">
	<!-- Header -->
	<div class="border-separator/20 flex h-16 items-center justify-between border-b px-4">
		<h2 class="grow truncate text-lg font-medium">{serverName}</h2>
		<button
			class="hover:bg-button/50 hover:text-accent ml-2 rounded-lg p-2 transition-colors duration-200"
			><ChevronDown /></button
		>
	</div>

	<!-- Channels -->
	<ScrollArea class="h-full">
		{#if fullData}
			{#each fullData as c}
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
						{#each c.channels as channel}
							<ChannelListButton name={channel.name} />
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</ScrollArea>
</div>
