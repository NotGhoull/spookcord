<!-- Imagine reading code, what a fuckin' nerd -->

<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		Hash,
		MessageCircleDashedIcon,
		MessageCircleQuestionIcon,
		ServerCrashIcon,
		Users
	} from '@lucide/svelte';
	import ChatInput from './ChatInput.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { orpc } from '$lib/orpc';
	import { fly, blur } from 'svelte/transition';
	import { isMemberViewVisible } from '$lib/localStates/sidebar';
	import { CurrentChannel } from '$lib/localStates/chat';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { derived, get } from 'svelte/store';
	import { channel, message, user } from '@spookcord/db-schema';
	import { supabaseService } from '$lib/supabase';
	import { toast } from 'svelte-sonner';
	import { Message } from '@spookcord/ui';

	const queryClient = useQueryClient();

	// State management stufF
	let scrollAreaRef: HTMLElement | null = $state(null); // TODO: Make it so we scroll to the bottom on new message

	type spookcordResponse = typeof channel & {
		messages: (typeof message.$inferSelect)[] &
			{
				sender: {
					name: string;
				};
			}[];
	};

	// Query
	const messagesQuery = createQuery<spookcordResponse>(
		derived(CurrentChannel, ($CurrentChannel) =>
			orpc.channel.get.queryOptions({
				input: { channelId: $CurrentChannel }
			})
		)
	);

	const JWTQuery = createQuery<string>(
		orpc.getJWT.queryOptions({
			refetchInterval: 3000000, // 50 minutes
			staleTime: 2400000, // Stale after 40 mins
			experimental_prefetchInRender: true
		})
	);

	$effect(() => {
		if ($CurrentChannel === 'NO_CHANNEL') {
			// Don't connect, if we're not in any channel
			supabaseService.disconnect();
		}

		supabaseService.connectToMessagesChannel($CurrentChannel, (state) => {
			// Note: This function really needs to be worked on, despite showing a load of type errors,
			// this code still works, it's a very hacky solution and needs to be refined

			switch (state.eventType) {
				case 'INSERT':
					// For some reason, if we try to infer select, everything breaks, and the object becomes undefined
					const newData = state.new;
					if (!newData) {
						toast.error('Error while adding new message: NewData is undefined or malformed');
						return;
					}

					const newMessageWithPlaceholderSender = {
						...newData,
						sender: { name: `Fetching user (${newData.sender_id})` }
					};

					// Optimistic update svelte query cache
					queryClient.setQueryData(
						orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
						(oldData: spookcordResponse) => {
							const newMessageWithSender = {
								...newData,
								// Placeholder, while we get the actual users name
								sender: { name: `Fetching user (${newData.senderId})` }
							};

							if (!oldData.messages.some((msg) => msg.id === newMessageWithSender.id)) {
								return {
									...oldData,
									messages: [...oldData.messages, newMessageWithSender]
								};
							}
						}
					);

					// We have to use sender_id here, otherwise, it breaks
					orpc.user.get.call({ userId: newData.sender_id }).then((response: typeof user) => {
						console.log('[MESSAGE UPDATE] Got user data!', response);
						const actualSenderName = response.name;

						queryClient.setQueryData(
							orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
							(currentChannelData: spookcordResponse | undefined) => {
								if (!currentChannelData) return currentChannelData; // No data to update

								const updatedMessages = currentChannelData.messages.map((msg) =>
									msg.id === newMessageWithPlaceholderSender.id
										? { ...msg, sender: { name: actualSenderName } } // Update the specific message
										: msg
								);

								return {
									...currentChannelData,
									messages: updatedMessages
								};
							}
						);
					});
					break;

				case 'UPDATE':
					queryClient.setQueryData(
						orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
						(oldData: spookcordResponse | undefined) => {
							if (oldData) {
								const newMessages = oldData.messages.map((message) =>
									message.id === state.old.id ? { ...message, ...state.new } : message
								);
								return {
									...oldData,
									messages: newMessages
								};
							}
						}
					);
					break;

				case 'DELETE':
					queryClient.setQueryData(
						orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
						(oldData: spookcordResponse) => {
							if (!oldData || !oldData.messages) {
								return oldData;
							}

							const updatedMessages = oldData.messages.filter(
								(message) => message.id !== state.old.id
							);

							return {
								...oldData,
								messages: updatedMessages
							};
						}
					);
			}
		});
	});

	onMount(async () => {
		await $JWTQuery.promise
			.then((data) => {
				supabaseService.init(data);
			})
			.catch((err) => {
				toast.error('FATAL ERROR, NO JWT!');
				throw new Error(err);
			});
	});

	$effect(() => {
		// TODO: Make it so we don't scroll if the user has scrolled up by themselves
		if ($messagesQuery.data) {
			if (scrollAreaRef) {
				scrollAreaRef.scrollTo({
					top: scrollAreaRef.scrollHeight,
					behavior: 'smooth'
				});
			}
		}
	});

	onDestroy(() => {
		supabaseService.disconnect();
	});
</script>

<div class="flex h-full w-full flex-col">
	<div class="border-separator/20 flex h-16 items-center justify-between border-b p-3">
		<div class="flex items-center gap-2">
			<div class="bg-button/50 flex h-8 w-8 items-center justify-center rounded-lg">
				<Hash class="text-accent h-5 w-5" />
			</div>
			<h2 class="text-accent text-lg font-medium">
				{$messagesQuery.data?.name ?? 'Loading'}
			</h2>
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

	<ScrollArea class="grow px-4 py-4 pt-0" bind:viewPortRef={scrollAreaRef}>
		{#if $CurrentChannel === 'NO_CHANNEL'}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<MessageCircleQuestionIcon class="size-20" />
				<h1 class="text-3xl font-bold">Did you get lost?</h1>
				<p>Select a channel on the side to start talking to spirits</p>
			</div>
		{:else if get(supabaseService.statusText) === 'Connecting...' || $messagesQuery.isLoading}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<div class="loader"></div>
				<h1 class="text-3xl font-bold">Loading messages...</h1>
				<p class="text-muted">
					{$messagesQuery.isFetching ? 'Fetching...' : 'Awaiting connection...'}
				</p>
			</div>
		{:else if $messagesQuery.isError}
			<div
				class="text-destructive flex h-full w-full flex-col items-center justify-center gap-2"
				transition:blur
			>
				<ServerCrashIcon class="size-20" />
				<h1 class="text-3xl font-bold">Something went wrong!</h1>
				<p>There was an issue fetching messages. Please try again.</p>
				<p>Error: {$messagesQuery.error.message}</p>
			</div>
		{:else if $messagesQuery.data.messages.length === 0}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<MessageCircleDashedIcon class="size-20" />
				<h1 class="text-3xl font-bold">No messages yet</h1>
				<p>Pretty lonely here, why not start the conversation?</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each $messagesQuery.data.messages as message (message.id)}
					<div in:fly|global={{ y: 40, duration: 600 }} out:blur|local={{ duration: 250 }}>
						<Message
							text={message.body}
							username={message.sender.name}
							createdAt={message.createdAt ?? new Date()}
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
