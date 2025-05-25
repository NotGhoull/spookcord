<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { orpc } from '$lib/orpc';
	import { BugIcon, PlusCircle, Shield, UploadIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import UserAreaComponent from './UserAreaComponent.svelte';
	import { CurrentChannel } from '$lib/localStates/chat';

	const inputID = 'SPOOKCORD_CHATAREA_INPUT';

	let value = $state('');
	let isFocused = $state(false); // Initialize with false

	let disableInput = $state(false);

	onMount(async () => {
		// Automatically focus the input when the component mounts
		// This ensures the user can immediately start typing.
		const el = document.getElementById(inputID);
		if (el instanceof HTMLInputElement) {
			// Type check for better safety
			el.focus();
		}
	});

	async function sendMessage() {
		// Prevent sending empty messages
		if (!value.trim()) {
			value = ''; // Clear the input if it was just whitespace
			return;
		}

		disableInput = true;
		console.warn('TODO: Use readable localstorage value (CURRENT_CHANNEL) for this value');

		try {
			await orpc.sendMessage.call({
				body: value,
				channelId: $CurrentChannel
			});
			value = ''; // Clear the input after successful send
		} catch (error) {
			console.error('Error sending message:', error);
			// Optionally, provide user feedback about the error
		} finally {
			// Ensure input is re-enabled and focused regardless of success or failure
			disableInput = false;

			// RequestAnimationFrame ensures the DOM has updated before focusing
			// This is crucial because `disableInput` might cause a re-render.
			requestAnimationFrame(() => {
				const el = document.getElementById(inputID);
				if (el instanceof HTMLInputElement) {
					// Type check for better safety
					el.focus();
				} else {
					console.error('MISSING INPUT or not an HTMLInputElement!');
				}
			});
		}
	}
</script>

<div class="flex gap-1 p-4 pt-0" onsubmit={sendMessage}>
	<UserAreaComponent />
	<!-- Its only like this to fix a bug -->
	<form class="grow">
		<div
			class="border-separator/20 bg-input-bg/50 relative w-full overflow-hidden rounded-xl border p-2 shadow-[0_0_15px_rgba(0,0,0,0.15)] backdrop-blur-sm"
		>
			<div
				class="text-muted hover:text-accent absolute top-3.5 left-3 cursor-pointer transition-colors duration-200"
			>
				<UploadIcon />
			</div>
			<Input
				id={inputID}
				bind:value
				placeholder="Feeling spooky?"
				disabled={disableInput}
				class="text-foreground placeholder:text-muted overflow-auto border-0 bg-transparent pr-20 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
			/>
			<button type="submit" class="sr-only">Send Message</button>
		</div>
	</form>
</div>
