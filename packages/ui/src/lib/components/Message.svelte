<script lang="ts">
	import { formatRelativeTime } from '$lib/realtive';
	import { onMount, onDestroy } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { fly, slide } from 'svelte/transition';
	import Button from './Button.svelte';
	import { PenLine, Trash, InfoIcon } from '@lucide/svelte';
	import { Tooltip } from 'bits-ui';

	let {
		username,
		pfp,
		text,
		createdAt,
		edited,
		isEditing,
		isSelf,
		lastEdited = new Date(),

		onTextEdited
	}: {
		username: string;
		pfp?: string;
		text: string;
		createdAt: Date;
		edited?: boolean;
		lastEdited: Date;
		isSelf: boolean;
		isEditing?: boolean;
		onTextEdited?: (newValue: string) => void;
	} = $props();

	// Reactive stuff for displayed text and its animation
	let displayedText = $state(text);
	let isTextUpdating = $state(false);

	// Reacitve stuff for the timestamp
	let realativeTimestamp = $state('');
	let isTimestampAnimating = $state(false);

	let intervalId: number | undefined;

	const ONE_HOUR_IN_MS = 60 * 60 * 1000;
	const TIMESTAMP_UPDATE_INTERNVAL_MS = 15000; // Update every 15 seconds
	const ANIMATION_DURATION_MS = 150; // Matches CSS

	function updateRelativeTime() {
		const newTime = formatRelativeTime(createdAt);
		const now = new Date();
		const difference = now.getTime() - createdAt.getTime();

		if (newTime !== realativeTimestamp) {
			realativeTimestamp = newTime;
		}

		// If the timestamp is older than an hour, don't update it
		if (difference >= ONE_HOUR_IN_MS && intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
	}

	onMount(() => {
		// Update time on mount
		updateRelativeTime();

		// Set up interval for continuous updates
		if (new Date().getTime() - createdAt.getTime() < ONE_HOUR_IN_MS) {
			intervalId = window.setInterval(updateRelativeTime, TIMESTAMP_UPDATE_INTERNVAL_MS);
		}
	});

	onDestroy(() => {
		// Clean up interval when destroyed
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	// Animate message text on text change
	$effect(() => {
		if (text !== displayedText) {
			isTextUpdating = true;
			setTimeout(() => {
				displayedText = text;
				// Ensure the DOM update happens before removing the class
				requestAnimationFrame(() => {
					isTextUpdating = false;
				});
			}, ANIMATION_DURATION_MS);
		}
	});

	// Update realtiveTimestamp on value change
	$effect(() => {
		// Check if the timestamp actually changed
		if (
			realativeTimestamp &&
			realativeTimestamp !== (document.querySelector('.timestamp-display')?.textContent || '')
		) {
			isTimestampAnimating = true;
			setTimeout(() => {
				requestAnimationFrame(() => {
					isTimestampAnimating = false;
				});
			}, ANIMATION_DURATION_MS);
		}
	});
</script>

<div
	class="group hover:bg-chat-area/80 relative flex gap-4 rounded-xl px-2 py-2 transition-all duration-200"
>
	{#if isSelf}
		<div
			class="absolute -top-3.5 right-0 mr-4 flex w-fit flex-row gap-1 rounded-md bg-black/50 p-1 opacity-0 transition-all duration-500 group-hover:opacity-100"
		>
			<Button variant="ghost" size="sm" class="h-8 w-8" onclick={() => (isEditing = true)}>
				<PenLine />
			</Button>
			<Button variant="ghost" size="sm" class="h-8 w-8">
				<Trash />
			</Button>
		</div>
	{/if}

	<Avatar {pfp} alt={`${username}'s profile picture`} />

	<div class="min-w-0 grow">
		<div class="flex items-center gap-2">
			<span class="font-medium transition-colors duration-300">{username ?? 'Unknown user'}</span>
			<span
				class="text-muted text-xs"
				class:timestamp-animate-out={isTimestampAnimating}
				class:timestamp-animate-in={!isTimestampAnimating}
			>
				{realativeTimestamp}
			</span>
		</div>

		{#if !isEditing}
			<div
				transition:slide
				class="mt-1 text-sm leading-relaxed break-words"
				class:text-blur={isTextUpdating}
				class:text-unblur={!isTextUpdating}
			>
				{displayedText}
			</div>
		{:else}
			<form
				transition:slide
				onsubmit={(e) => {
					e.preventDefault();
					console.log(`SUBMITTED! (${text})`);
					isEditing = false;
					if (onTextEdited) {
						onTextEdited(text);
					}
				}}
			>
				<div>
					<input
						class="bg-chat-area/80 border-foreground w-full rounded-sm p-2"
						bind:value={text}
					/>
					<p class="text-muted text-xs">Press <span class="text-primary">Enter</span> to confirm</p>
				</div>
			</form>
		{/if}
		{#if edited}
			<div transition:slide>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger class="text-muted flex gap-1 text-xs">
							<InfoIcon size="15" />

							<span class="text-muted text-xs">This message has been edited</span>
						</Tooltip.Trigger>
						<Tooltip.Portal>
							<Tooltip.Content side="right">
								<div
									class="shadow-popover z-10 flex items-center justify-center rounded-xl bg-black p-3 text-sm text-xs font-medium outline-hidden"
								>
									<p>
										This message was edited <b>{formatRelativeTime(lastEdited ?? Date.now())}</b>
									</p>
									<Tooltip.Arrow class="text-black" />
								</div>
							</Tooltip.Content>
						</Tooltip.Portal>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		{/if}
	</div>
</div>

<style>
	/* CSS for the main text blur effect */
	.text-blur {
		filter: blur(4px);
		opacity: 0.5;
		transition:
			filter 0.15s ease-out,
			opacity 0.15s ease-out;
	}

	.text-unblur {
		filter: blur(0);
		opacity: 1;
		transition:
			filter 0.15s ease-in,
			opacity 0.15s ease-in;
	}

	.timestamp-animate-out {
		opacity: 0;
		filter: blur(2px);
		transform: translateY(-5px);
		transition:
			opacity 0.15s ease-out,
			filter 0.15s ease-out,
			transform 0.15s ease-out;
	}

	.timestamp-animate-in {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0);
		transition:
			opacity 0.15s ease-in,
			filter 0.15s ease-in,
			transform 0.15s ease-in;
	}
</style>
