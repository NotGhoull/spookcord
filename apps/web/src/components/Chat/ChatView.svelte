<!-- Imagine reading code, what a fuckin' nerd -->

<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Hash, MessageCircleDashedIcon, Users } from '@lucide/svelte';
	import MessageComponent from './MessageComponent.svelte';
	import ChatInput from './ChatInput.svelte';
	import { createClient } from '@supabase/supabase-js';
	import { onMount, onDestroy } from 'svelte';
	import { orpc } from '$lib/orpc';
	import { fly, blur } from 'svelte/transition';
	import { isMemberViewVisible } from '$lib/localStates/sidebar';
	import { CurrentChannel } from '$lib/localStates/chat';
	import { env } from '$env/dynamic/public';

	type Message = {
		id: string;
		body: string;
		createdAt: Date;
		updatedAt: Date;
		senderId: string;
		channelId: string;
	};

	let messages = $state<Message[]>([]);

	let orderedMessages = $derived.by(() => {
		const messagesWithParsedDates = messages.map((msg) => ({
			...msg,
			createdAt:
				msg.createdAt instanceof Date
					? msg.createdAt
					: msg.createdAt
						? new Date(msg.createdAt)
						: new Date()
		}));

		// This can easily be refactored on the server side.
		const sorted = [...messagesWithParsedDates].sort((a, b) => {
			const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
			const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
			return dateA.getTime() - dateB.getTime();
		});

		return sorted;
	});

	let supabaseClient: ReturnType<typeof createClient>;
	let realtimeChannel: ReturnType<typeof supabaseClient.channel> | null = null;
	let shouldStartConnection = $state(false);

	let isConnectedToRealtime = $state(false);
	let loadingStatusText = $state('Loading messages...');
	let loadingTimeout: ReturnType<typeof setTimeout>;

	function connectToRealtime(channel: string) {
		if (realtimeChannel != null) {
			realtimeChannel.unsubscribe();
			console.log('Unsubscribed');
		}

		realtimeChannel = supabaseClient
			.channel(`channel:${channel}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'message',
					filter: `channel_id=eq.${channel}`
				},
				(payload) => {
					console.log('GOT REALTIME UPDATE FOR MESSAGE!', payload);
					const old = payload.old as Partial<Message>;

					switch (payload.eventType) {
						case 'UPDATE':
							messages = messages.map((message) =>
								message.id === old.id ? ({ ...message, ...payload.new } as Message) : message
							);
							break;
						case 'INSERT':
							messages = [...messages, payload.new as Message];
							break;
						case 'DELETE':
							console.log('Delete message fired');
							messages = messages.filter((message) => message.id !== old.id);
							console.log('Deleted message!');
							break;
					}
				}
			)
			.subscribe((status, err) => {
				if (status === 'SUBSCRIBED') {
					console.log(`Successfully subscribed to channel:${channel} messages`);
					isConnectedToRealtime = true;
					clearTimeout(loadingTimeout);
				} else if (status === 'CHANNEL_ERROR') {
					console.error(`Realtime channel error for ${channel}:`, err, status);
					loadingStatusText = `Connection error: ${err?.message || 'Check network & RLS'}`;
					clearTimeout(loadingTimeout);
				} else if (status === 'TIMED_OUT') {
					console.warn(`Realtime subscription timed out for ${channel}.`);
					loadingStatusText = 'Connection timed out. Check network or server.';
					clearTimeout(loadingTimeout);
				} else {
					console.log(`Realtime channel status: ${status}`);
				}
			});
	}

	$effect(() => {
		if (shouldStartConnection == false) {
			return;
		}

		connectToRealtime($CurrentChannel);
		async function get() {
			messages = await orpc.getMessages.call({ channelId: $CurrentChannel });
			console.log('Messages updated!');
		}
		get();
	});

	onMount(async () => {
		const jwt = await orpc.getJWT.call({});

		loadingTimeout = setTimeout(() => {
			if (!shouldStartConnection) {
				loadingStatusText = 'Loading (Are you actually connected to the internet?)';
			}
		}, 30000); // 30 seconds

		// TODO: This should be moved to lib/supabaseClient
		supabaseClient = createClient(env.PUBLIC_SUPABASE_URL, jwt);
		supabaseClient.realtime.setAuth(jwt); // <- This can still be done here though
		//                                          - Or we add an argument to create a client with JWT like above

		shouldStartConnection = true;
	});

	onDestroy(() => {
		clearTimeout(loadingTimeout);
		if (realtimeChannel) {
			console.log(`Unsubscribing from channel:${CurrentChannel}`);
			realtimeChannel.unsubscribe();
		}
	});

	let currentChannelName = $state();

	$effect(() => {
		console.log('[A15] Effect triggered!');
		async function get() {
			await orpc.getChannelById
				.call({ id: $CurrentChannel })
				.then((data) => {
					console.log('[A15] Got resp!');
					currentChannelName = data?.name ?? 'Unknown';
				})
				.catch((e) => {
					currentChannelName = 'ERROR!';
					console.error(e);
				});
		}
		get();
	});

	$inspect(messages);
</script>

<div class="flex h-full w-full flex-col">
	<div class="border-separator/20 flex h-16 items-center justify-between border-b px-4">
		<div class="flex items-center gap-2">
			<div class="bg-button/50 flex h-8 w-8 items-center justify-center rounded-lg">
				<Hash class="text-accent h-5 w-5" />
			</div>
			<h2 class="text-accent text-lg font-medium">{currentChannelName}</h2>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={() => {
					$isMemberViewVisible = !$isMemberViewVisible;
				}}
				class="text-muted hover:bg-button/50 hover:text-accent rounded-lg p-2 transition-colors duration-200"
			>
				<Users />
			</button>
		</div>
	</div>

	<ScrollArea class="grow px-4 py-4">
		{#if !isConnectedToRealtime}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<!-- <MessageCircleDashedIcon class="size-20" /> -->
				<div class="loader"></div>
				<h1 class="text-3xl font-bold">{loadingStatusText}</h1>
				<p></p>
			</div>
		{:else if orderedMessages.length === 0}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<MessageCircleDashedIcon class="size-20" />
				<h1 class="text-3xl font-bold">No messages yet</h1>
				<p>Pretty lonely here, why not start the conversation?</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each orderedMessages as message (message.id)}
					<div in:fly|global={{ y: 40, duration: 600 }} out:blur|local={{ duration: 250 }}>
						<MessageComponent
							senderId={message.senderId}
							createdAt={message.createdAt}
							text={message.body}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</ScrollArea>

	<ChatInput />
</div>

<style>
	/* Credit css-loaders.com */
	.loader {
		width: 60px;
		aspect-ratio: 1;
		--g: conic-gradient(from -90deg at 10px 10px, #fff 90deg, #0000 0);
		background: var(--g), var(--g), var(--g);
		background-size: 50% 50%;
		animation: l16 1s infinite;
	}
	@keyframes l16 {
		0% {
			background-position:
				0 0,
				10px 10px,
				20px 20px;
		}
		50% {
			background-position:
				0 20px,
				10px 10px,
				20px 0;
		}
		100% {
			background-position:
				20px 20px,
				10px 10px,
				0 0;
		}
	}
</style>
