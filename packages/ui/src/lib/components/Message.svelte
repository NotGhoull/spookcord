<script lang="ts">
	import { formatRelativeTime } from '$lib/realtive';
	import { onMount, onDestroy } from 'svelte';
	import Avatar from './Avatar.svelte';

	const {
		username,
		pfp,
		text,
		createdAt
	}: { username: string; pfp?: string; text: string; createdAt: Date } = $props();

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

<div class="group relative flex gap-4 rounded-xl px-2 py-2 transition-all duration-200">
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

		<div
			class="mt-1 text-sm leading-relaxed break-words"
			class:text-blur={isTextUpdating}
			class:text-unblur={!isTextUpdating}
		>
			{displayedText}
		</div>
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
