<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { emit } from '$lib/eventbus';
	import { orpc } from '$lib/orpc';
	import { HousePlusIcon, TrashIcon, XIcon } from '@lucide/svelte';
	import { SERVER_CREATE_INPUT } from '@spookcord/types/api/server';
	import { Button } from '@spookcord/ui';
	import { Dialog, Portal } from 'bits-ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod/v4-mini';

	let { open = $bindable(false) } = $props();
	let serverName = $state('');
</script>

<Dialog.Root bind:open>
	<Dialog.Portal to="#SPOOKCORD_PORTAL_BASE">
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
		/>
		<Dialog.Content
			class="bg-background/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-separator/30 fixed top-[50%] left-[50%] z-50 flex h-auto max-h-[90vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border p-0 p-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] outline-hidden backdrop-blur-xl"
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
				<div class="border-separator/10 flex items-center justify-between border-b p-6">
					<h2 class="text-foreground text-xl font-bold">Create a Manor</h2>
					<Dialog.Close
						class="hover:bg-background/20 rounded-full p-2 transition-colors hover:cursor-pointer"
					>
						<XIcon class="text-foreground/70 h-5 w-5" />
					</Dialog.Close>
				</div>

				<!-- Content -->
				<div class="min-h-[200px] p-6">
					<div class="space-y-6">
						<div class="space-y-2">
							<h3 class="text-foreground text-lg font-semibold">Basic information</h3>
							<p class="text-foreground/70 text-sm">
								Let's start with the basics. What do you want to call your Manor?
							</p>
						</div>

						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="manor-name">Manor name</Label>
								<Input
									id="manor-name"
									bind:value={serverName}
									placeholder="My cool manor"
									class="bg-background/20 placeholder:text-foreground/50 border-separator/20 focus:border-primary"
								/>
								<p class="text-foreground/70 text-xs">Choose a name that reflects your community</p>
							</div>
						</div>
						<Button
							variant="primary"
							fullWidth
							icon={HousePlusIcon}
							onclick={async () => {
								if (!serverName) {
									toast.error('Please make sure you made a name');
									return;
								}
								let schemaResult = SERVER_CREATE_INPUT.safeParse({ serverName: serverName });
								if (!schemaResult.success) {
									let pretty = z.prettifyError(schemaResult.error);
									toast.error(pretty);
									return;
								}

								open = false;
								let errorMsg: string = 'Unexpected error';
								const promise = new Promise<string>(async (resolve, reject) => {
									const response = await orpc.server.create.call({ serverName: serverName });

									if (!response.success) {
										// If we don't get a error object, its most likely a network error
										errorMsg = response.error!.message ?? 'Network error';
										console.log('PROMISE REJECTED!');
										reject(errorMsg);
										return;
									}

									resolve('Created server!');
									emit('updateManorList', null);
								});
								toast.promise(promise, {
									loading: 'Creating your manor...',
									success: (message) => {
										return message;
									},
									error: errorMsg
								});
							}}>Create manor</Button
						>
						<p class="text-muted text-xs">
							More options will come in the future, this is all we have for now
							<br />
							*Your manor {serverName ? `"${serverName}"` : ''} will be created with a default catagory
							and channel
						</p>
					</div>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
