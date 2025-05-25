<script lang="ts">
	import { orpc } from '$lib/orpc';
	import { formatRelativeTime } from '$lib/realtive';
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	let username = $state('Loading...');
	const { senderId, text, createdAt }: { senderId: string; text: string; createdAt: Date } =
		$props();

	// Local state to track the displayed text and trigger animation for main message
	let displayedText = $state(text);
	let isTextUpdating = $state(false);

	// Reactive state for the actual calculated relative timestamp
	let relativeTimestamp = $state('');
	// State for the *displayed* relative timestamp, used for animation
	let displayRelativeTimestamp = $state('');
	let isTimestampAnimating = $state(false); // Controls animation classes for timestamp

	let intervalId: number | undefined; // To store the ID of the interval

	const ONE_HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
	const TIMESTAMP_UPDATE_INTERVAL_MS = 15000; // Update every 15 seconds

	function updateRelativeTime() {
		const now = new Date();
		const diffInMs = now.getTime() - createdAt.getTime();

		let newRelativeTime: string;

		if (diffInMs < ONE_HOUR_IN_MS) {
			newRelativeTime = formatRelativeTime(createdAt);
		} else {
			// If it's older than an hour, display it once and clear the interval
			newRelativeTime = formatRelativeTime(createdAt);
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = undefined; // Clear the stored ID
			}
		}

		// Only update if the relative time string has actually changed
		if (newRelativeTime !== relativeTimestamp) {
			relativeTimestamp = newRelativeTime;
		}
	}

	onMount(async () => {
		try {
			const data = await orpc.getUserById.call({ id: senderId });
			if (!data) {
				toast.error('Cannot get user data (No data)');
				return;
			}
			username = data.name;
		} catch (error) {
			console.error('Error fetching user data:', error);
			toast.error('Failed to load user data');
			username = 'ERROR!'; // Fallback
		}

		// Initial update
		updateRelativeTime();
		displayRelativeTimestamp = relativeTimestamp; // Set initial displayed value

		// Set up the interval for continuous updates
		// Only set up if it's potentially still within the animated range
		if (new Date().getTime() - createdAt.getTime() < ONE_HOUR_IN_MS) {
			intervalId = window.setInterval(updateRelativeTime, TIMESTAMP_UPDATE_INTERVAL_MS);
		}
	});

	// Clean up the interval when the component is destroyed
	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	// Effect for animating the main message text
	$effect(() => {
		if (text !== displayedText) {
			isTextUpdating = true; // Start blur
			setTimeout(() => {
				displayedText = text; // Update to new text
				requestAnimationFrame(() => {
					isTextUpdating = false; // End blur
				});
			}, 150); // This delay should match the CSS blur-out duration
		}
	});

	// Effect for animating the relative timestamp
	$effect(() => {
		// This effect runs whenever `relativeTimestamp` changes
		if (relativeTimestamp && relativeTimestamp !== displayRelativeTimestamp) {
			isTimestampAnimating = true; // Trigger fade/blur out
			setTimeout(() => {
				displayRelativeTimestamp = relativeTimestamp; // Update the displayed text
				requestAnimationFrame(() => {
					isTimestampAnimating = false; // Trigger fade/blur in
				});
			}, 150); // Match this with your CSS transition duration for the timestamp
		} else if (!relativeTimestamp) {
			// Handle initial case or if relativeTimestamp becomes empty for some reason
			displayRelativeTimestamp = relativeTimestamp;
			isTimestampAnimating = false;
		}
	});
</script>

<div class="group relative flex gap-4 rounded-xl px-2 py-2 transition-all duration-200">
	<div
		class="relative h-11 w-11 shrink-0 scale-100 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
		style="background-color: rgb(255, 107, 0);"
	>
		<div class="absolute inset-0 flex items-center justify-center text-xl">
			{username.slice(0, 2) ?? '?'}
		</div>
	</div>

	<div class="min-w-0 grow">
		<div class="flex items-center gap-2">
			<span class="font-medium transition-colors duration-300">{username ?? 'Unknown user'}</span>
			<span
				class="text-muted text-xs"
				class:timestamp-animate-out={isTimestampAnimating &&
					relativeTimestamp !== displayRelativeTimestamp}
				class:timestamp-animate-in={!isTimestampAnimating &&
					relativeTimestamp === displayRelativeTimestamp}
			>
				{displayRelativeTimestamp}
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

	/* New CSS for timestamp animation */
	.timestamp-animate-out {
		opacity: 0;
		filter: blur(2px); /* Slight blur helps with the transition */
		transform: translateY(-5px); /* Optional: a slight vertical movement */
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
