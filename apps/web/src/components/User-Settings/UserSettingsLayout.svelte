<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { cn } from '$lib/utils';
	import {
		Accessibility,
		Bell,
		ChevronLeftIcon,
		Database,
		Keyboard,
		LogOutIcon,
		Palette,
		Shield,
		User,
		XIcon
	} from '@lucide/svelte';
	import UserProfileSettings from './UserProfileSettings.svelte';
	import { Dialog } from 'bits-ui';

	let { open = $bindable() } = $props();

	const isMobile = false;
	const showMobileNav = false;
	let activeSection = $state('profile');

	const settingsSections = [
		{ id: 'profile', label: 'My Account', icon: User },
		{ id: 'appearance', label: 'Appearance', icon: Palette },
		{ id: 'notifications', label: 'Notifications', icon: Bell },
		{ id: 'privacy', label: 'Privacy & Safety', icon: Shield },
		{ id: 'accessibility', label: 'Accessibility', icon: Accessibility },
		{ id: 'keybindings', label: 'Keybindings', icon: Keyboard },
		{ id: 'data', label: 'Data Management', icon: Database }
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Portal to="#SPOOKCORD_PORTAL_BASE">
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="border-separator/20 bg-background/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex h-full max-h-[800px] w-full max-w-6xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border shadow-[0_0_30px_rgba(0,0,0,0.3)] outline-hidden"
			trapFocus={true}
			onEscapeKeydown={(e) => {
				e.preventDefault(); // Prevent default close behavior if you want to add custom logic [cite: 445]
				open = false; // Manually close the dialog if escape is pressed
			}}
			onInteractOutside={(e) => {
				e.preventDefault(); // Prevent default close behavior if you want to add custom logic [cite: 453]
				open = false; // Manually close the dialog if clicked outside
			}}
		>
			<Dialog.Close
				class="text-muted hover:bg-button/50 hover:text-accent absolute top-4 right-4 z-50 rounded-lg p-1.5 transition-colors duration-200"
			>
				<XIcon class="h-5 w-5" />
			</Dialog.Close>

			<div
				class={cn(
					'border-separator/20 flex w-64 flex-col border-r transition-all duration-300',
					isMobile && !showMobileNav ? 'hidden' : 'block'
				)}
			>
				<div class="p-6">
					<Dialog.Title class="text-accent text-xl font-bold">User settings</Dialog.Title>
				</div>

				<ScrollArea class="grow">
					<div class="flex flex-col space-y-1 p-2">
						{#each settingsSections as section (section.id)}
							<button
								aria-label={section.label}
								class={cn(
									'flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
									activeSection === section.id
										? 'bg-accent/20 text-accent'
										: 'text-muted hover:bg-button/50 hover:text-foreground'
								)}
								onclick={() => (activeSection = section.id)}
							>
								<section.icon class="h-5 w-5" />
								<span>{section.label}</span>
							</button>
						{/each}
					</div>
				</ScrollArea>

				<div class="border-separator/20 border-t p-4">
					<button
						aria-label="Log out"
						class="bg-destructive flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
					>
						<LogOutIcon class="h-4 w-4" />
						Log out
					</button>
				</div>
			</div>

			<div
				class={cn(
					'flex flex-1 transition-all duration-300',
					isMobile && showMobileNav ? 'hidden' : 'block'
				)}
			>
				{#if isMobile && !showMobileNav}
					<div class="border-separator/20 flex h-16 items-center border-b px-4">
						<button
							class="hover:bg-button/50 hover:text-accent mr-2 rounded-lg p-1.5 transition-colors duration-200"
						>
							<ChevronLeftIcon class="h-5 w-5" />
						</button>
						<h2 class="text-lg font-medium">
							{settingsSections.find((s) => s.id === activeSection)?.label}
						</h2>
					</div>
				{/if}

				<div class="flex-1 overflow-hidden">
					{#if activeSection == 'profile'}
						<UserProfileSettings />
					{/if}
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
