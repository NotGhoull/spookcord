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
	import { authClient } from '$lib/auth-client';
	import { ROUTER_GET_MESSAGES_OUTPUT } from '@spookcord/types/api/channel';
	import type { z } from 'zod/v4';

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
	const messagesQuery = createQuery(
		derived(CurrentChannel, ($CurrentChannel) =>
			orpc.channel.get.queryOptions({
				input: { channelId: $CurrentChannel }
			})
		)
	);

	const JWTQuery = createQuery<string>(
		orpc.auth.getJWT.queryOptions({
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

			// Fix: Why the fuck does state.old use underscores now, instead of the actual naming, despite being the same type?
			switch (state.eventType) {
				case 'INSERT':
					// For some reason, if we try to infer select, everything breaks, and the object becomes undefined
					const newData = state.new;
					if (!newData) {
						toast.error('Error while adding new message: NewData is undefined or malformed');
						return;
					}

					newData.createdAt = new Date(newData.createdAt);
					newData.updatedAt = new Date(newData.updatedAt);

					const newMessageWithPlaceholderSender = {
						...newData,
						sender: { name: `Fetching user (${newData.senderId})` }
					};

					// Optimistic update svelte query cache
					queryClient.setQueryData(
						orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
						(oldData: z.infer<typeof ROUTER_GET_MESSAGES_OUTPUT>) => {
							// oldData = oldData as
							const newMessageWithSender = {
								...newData,
								// Placeholder, while we get the actual users name
								sender: { name: `Fetching user (${newData.senderId})` }
							};

							if (!oldData.response!.messages!.some((msg) => msg.id === newMessageWithSender.id)) {
								console.log(`[Insanity/debug] Returned!`);
								return {
									...oldData,
									response: {
										messages: [...oldData.response!.messages, newMessageWithSender]
									}
								};
							}
						}
					);

					// We have to use sender_id here, otherwise, it breaks
					orpc.user.get.call({ userId: newData.senderId }).then((response) => {
						console.log('[MESSAGE UPDATE] Got user data!', response);
						let actualSenderName: string;
						if (!response.success) {
							actualSenderName = `Unknown ${response.error!.code}`;
							toast.error(`Failed to fetch sender name "${response.error!.details}"`);
						} else {
							actualSenderName = response.response!.name;
						}

						queryClient.setQueryData(
							orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
							(currentChannelData: z.infer<typeof ROUTER_GET_MESSAGES_OUTPUT>) => {
								if (!currentChannelData) return currentChannelData; // No data to update

								const updatedMessages = currentChannelData.response!.messages.map((msg) =>
									msg.id === newMessageWithPlaceholderSender.id
										? { ...msg, sender: { name: actualSenderName } } // Update the specific message
										: msg
								);

								return {
									...currentChannelData,
									response: {
										messages: updatedMessages
									}
								};
							}
						);
					});
					break;

				case 'UPDATE':
					queryClient.setQueryData(
						orpc.channel.get.queryOptions({ input: { channelId: $CurrentChannel } }).queryKey,
						(oldData: spookcordResponse | undefined) => {
							console.log('GOT UPDATE!');
							if (oldData) {
								state.new.createdAt = new Date(state.new.createdAt);
								state.new.updatedAt = new Date(state.new.updatedAt);

								const newMessages = oldData.messages.map((message) =>
									message.id === state.old.id ? { ...message, ...state.new } : message
								);

								console.debug('newMessages VALUE', newMessages);
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

	function handleMessageEdit(message: string, messageId: string) {
		orpc.channel.updateMessage.call({ messageId: messageId, newText: message }).then((data) => {
			if (!data.success) {
				toast.error(`Failed to edit message ${data.response.message ?? 'Unknown error'}`);
			}
		});
	}

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
				<Hash class="text-primary h-5 w-5" />
			</div>
			<h2 class="text-primary text-lg font-medium">
				<!-- TODO: Add better error handling here -->
				{$messagesQuery.data?.response?.name ?? 'Loading'}
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
		{:else if !$messagesQuery.data?.success}
			<div>
				<p>This is where the error message would go</p>
				<p>{$messagesQuery.data!.error!.message} ({$messagesQuery.data!.error!.code})</p>
			</div>
		{:else if $messagesQuery.data?.response?.messages.length === 0}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2" transition:blur>
				<MessageCircleDashedIcon class="size-20" />
				<h1 class="text-3xl font-bold">No messages yet</h1>
				<p>Pretty lonely here, why not start the conversation?</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each $messagesQuery.data!.response!.messages as message (message.id)}
					<!-- Sometimes, createdAt() ends up being undefined, this normally happens when a new message is made though, so we can assume its new -->
					<div in:fly|global={{ y: 40, duration: 600 }} out:blur|local={{ duration: 250 }}>
						<Message
							text={message.body}
							isSelf={message.senderId == authClient.useSession().get().data?.session.userId}
							username={message.sender.name}
							createdAt={message.createdAt}
							edited={message.createdAt.getTime() != message.updatedAt.getTime()}
							lastEdited={message.updatedAt}
							onTextEdited={(data) => handleMessageEdit(data, message.id)}
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
