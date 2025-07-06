<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ExternalLinkIcon, HashIcon, InfoIcon, Volume2Icon, XIcon } from '@lucide/svelte';
	import { Button } from '@spookcord/ui';
	import { Dialog } from 'bits-ui';

	let { open = $bindable(false) } = $props();
	let selected = $state('text');
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
		/>
		<Dialog.Content
			class="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-separator/30 fixed top-[50%] left-[50%] z-50 flex h-auto max-h-[90vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border p-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] outline-hidden backdrop-blur-xl"
			trapFocus={true}
			onEscapeKeydown={(e) => {
				e.preventDefault();
				open = false;
			}}
			onInteractOutside={(e) => {
				e.preventDefault();
				open = false;
			}}
		>
			<div class="relative">
				<div class="from-primary/5 to-secondary/5 mb-4 bg-gradient-to-tr p-6">
					<Dialog.Close class="absolute right-5 m-0 cursor-pointer rounded-full p-0">
						<XIcon class="hover:bg-accent text-foreground/70 h-5 w-5" />
					</Dialog.Close>
					<div></div>
					<h2 class="text-foreground text-xl font-bold">Create a Channel</h2>
					<p class="text-muted text-sm">
						Creating a new channel in <span class="text-primary font-bold">General</span>
					</p>
				</div>

				<!-- Content -->
				<div class="min-h-[200px] pl-6">
					<div class="border-separator/10 space-y-2 border-b pb-4">
						<h3 class="text-foreground text-lg font-semibold">Channel name</h3>
						<div class="relative mr-4">
							<HashIcon class="text-muted absolute top-[25%] left-2.5 h-5 w-5" />
							<Input placeholder="My insane channel" class="placeholder:text-muted pl-8" />
						</div>
						<p class="text-muted text-xs">
							This will be the name of the channel, you will <b>NOT</b> be able to change this later
							(since its not implemented)
						</p>
					</div>
					<div class="border-separator/10 border-b pb-4">
						<h3 class="text-foreground pb-2 text-lg font-semibold">Channel type</h3>
						<div class="space-y-2 pb-4">
							{@render channelTypeOption(
								'RADIO_TEXT',
								'text',
								'Text channel',
								'Send messages to your friends, and share memes, sometimes'
							)}
							{@render channelTypeOption(
								'RADIO_VOICE',
								'Voice',
								'Voice channel',
								'Speak and connect to your friends through voice',
								true,
								true
							)}
						</div>
						<div
							class="mr-4 flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 p-3"
						>
							<InfoIcon class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
							<div>
								<p class="font-semibold text-blue-400">Note</p>
								<p class="text-sm text-blue-300/80">
									Voice channel functionality is currently under development and will be available
									soon.
									<br />
									<a
										class="inline-flex gap-1 underline"
										href="https://github.com/NotGhoull/spookcord"
										>Track the progress <span><ExternalLinkIcon class="h-4 w-4" /></span></a
									>
								</p>
							</div>
						</div>
					</div>
					<div class="mr-4 flex gap-2 pb-8">
						<Button variant="outline" fullWidth>Cancel</Button>
						<Button
							fullWidth
							onclick={() => {
								console.log('Do the thing');
							}}>Create channel</Button
						>
					</div>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

{#snippet channelTypeOption(
	id: string,
	value: string,
	title: string,
	description: string,
	altIcon?: boolean,
	disabled?: boolean
)}
	<div
		class={`group relative  mr-4 rounded-xl border-2 p-4 transition-all duration-200  ${disabled ? 'text-muted cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selected === value ? 'border-primary/50 bg-primary/5' : 'border-white/10'}`}
	>
		<div class={`flex items-center gap-3`}>
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/30 transition-colors"
			>
				{#if selected === value}
					<div class="bg-primary h-2 w-2 rounded-full"></div>
				{/if}
			</div>
			{#if !altIcon}
				<HashIcon class="text-muted h-5 w-5" />
			{:else}
				<Volume2Icon class="text-muted h-5 w-5" />
			{/if}
			<div class="flex-1">
				<p class="font-medium">{title}</p>
				<p class="text-muted text-xs">{description}</p>
			</div>
		</div>
	</div>
	<!-- <div
		class={`flex w-full items-center space-x-3 ${disabled ? 'text-muted [&>*]:cursor-not-allowed' : '[&>*]:cursor-pointer'}`}
	>
		<RadioGroupItem {id} {value} {disabled} />
		<Label for={id} class="flex  items-center gap-2">
			{#if !altIcon}
				<HashIcon />
			{:else}
				<Volume2Icon />
			{/if}
			<div class="flex flex-col gap-1">
				<p class="font-medium">{title}</p>
				<p class="text-muted text-xs">{description}</p>
			</div>
		</Label>
	</div> -->
{/snippet}
