<script>
	import { ArrowRight, Hash, Plus, UsersRound, XIcon } from '@lucide/svelte';
	import { Dialog } from 'bits-ui';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import { orpc } from '$lib/orpc';
	import { emit } from '$lib/eventbus';
	import CreateServerPopup from './CreateServerPopup.svelte';

	let targetServerCode = $state('');

	let { open = $bindable() } = $props();
	let showingCreationUI = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Portal to="#SPOOKCORD_PORTAL_BASE">
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
		/>
		<Dialog.Content
			class="bg-background/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-separator/30 fixed top-[50%] left-[50%] z-50 flex h-auto max-h-[90vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] outline-hidden backdrop-blur-xl"
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
			<!-- Close Button -->
			<Dialog.Close
				class="text-muted hover:bg-button/50 hover:text-foreground group absolute top-6 right-6 z-50 rounded-full p-2 transition-all duration-300"
			>
				<XIcon class="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
			</Dialog.Close>

			<!-- Header with Gradient -->
			<div
				class="from-primary/10 to-secondary/5 relative overflow-hidden bg-gradient-to-br via-transparent px-8 pt-12 pb-8"
			>
				<!-- Decorative Elements -->
				<div
					class="bg-primary/5 animate-pulse-glow absolute top-4 left-8 h-24 w-24 rounded-full blur-2xl"
				></div>
				<div
					class="bg-secondary/5 animate-pulse-glow absolute right-12 bottom-2 h-16 w-16 rounded-full blur-xl"
					style="animation-delay: 1s;"
				></div>

				<div class="relative z-10 text-center">
					<div class="mb-4 flex justify-center">
						<div class="relative">
							<div
								class="bg-primary/20 animate-pulse-glow absolute inset-0 rounded-2xl blur-md"
							></div>
							<div class="from-primary to-primary/80 relative rounded-2xl bg-gradient-to-br p-4">
								<UsersRound class="animate-float h-8 w-8 text-white" />
							</div>
						</div>
					</div>
					<Dialog.Title class="text-foreground mb-3 text-3xl font-bold tracking-tight">
						Ready to explore?
					</Dialog.Title>
					<p class="text-muted mx-auto max-w-md text-lg leading-relaxed">
						Choose your path to connect, create, and collaborate
					</p>
				</div>
			</div>

			<!-- Main Content -->
			<div class="flex-1 px-8 py-6">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Create Server Card -->
					<!-- svelte-ignore a11y_interactive_supports_focus -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						role="button"
						class="group bg-card hover:bg-card/80 border-separator/50 hover:border-primary/30 relative cursor-pointer overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-8px_rgba(255,102,0,0.15)]"
						onclick={() => {
							open = false;
							showingCreationUI = true;
						}}
					>
						<!-- Background Glow Effect -->
						<div
							class="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
						></div>

						<div class="relative z-10">
							<!-- Icon -->
							<div class="mb-6 flex justify-center">
								<div class="relative">
									<div
										class="bg-primary/20 absolute inset-0 rounded-xl blur-sm transition-all duration-500 group-hover:blur-md"
									></div>
									<div
										class="from-primary via-primary to-primary/90 relative rounded-xl bg-gradient-to-br p-3 transition-transform duration-500 group-hover:scale-110"
									>
										<Plus class="h-6 w-6 text-white" />
									</div>
								</div>
							</div>

							<!-- Content -->
							<div class="space-y-3 text-center">
								<h3
									class="text-foreground group-hover:text-primary/90 text-xl font-bold transition-colors duration-300"
								>
									Create Server
								</h3>
								<p class="text-muted text-sm leading-relaxed">
									Build your own community from the ground up
								</p>

								<!-- Action Indicator -->
								<div
									class="pt-2 opacity-0 transition-all delay-100 duration-300 group-hover:opacity-100"
								>
									<div class="text-primary inline-flex items-center gap-2 text-sm font-medium">
										<span>Get Started</span>
										<ArrowRight
											class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
										/>
									</div>
								</div>
							</div>
						</div>

						<!-- Subtle Pattern Overlay -->
						<div
							class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-5"
						></div>
					</div>

					<!-- Join Server Card -->
					<div class="bg-card border-separator/50 relative overflow-hidden rounded-2xl border p-8">
						<!-- Background Elements -->
						<div
							class="bg-secondary/5 animate-pulse-glow absolute top-4 right-4 h-20 w-20 rounded-full blur-xl"
							style="animation-delay: 0.5s;"
						></div>

						<div class="relative z-10">
							<!-- Icon -->
							<div class="mb-6 flex justify-center">
								<div class="relative">
									<div class="bg-secondary/20 absolute inset-0 rounded-xl blur-sm"></div>
									<div
										class="from-secondary to-secondary/90 relative rounded-xl bg-gradient-to-br p-3"
									>
										<Hash class="h-6 w-6 text-white" />
									</div>
								</div>
							</div>

							<!-- Content -->
							<div class="mb-6 space-y-4 text-center">
								<h3 class="text-foreground text-xl font-bold">Join Server</h3>
								<p class="text-muted text-sm leading-relaxed">Connect with existing communities</p>
							</div>

							<!-- Input Section -->
							<div class="space-y-4">
								<div class="relative">
									<Input
										bind:value={targetServerCode}
										placeholder="Enter invite code or link..."
										class="bg-input-bg/50 border-separator/50 focus:border-primary/50 text-foreground placeholder:text-muted/60 focus:bg-input-bg w-full rounded-xl px-4 py-3 transition-all duration-300 focus:shadow-[0_0_20px_rgba(255,102,0,0.1)]"
									/>
								</div>

								<button
									class="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_-6px_rgba(255,102,0,0.4)] active:scale-[0.98]"
									onclick={async () => {
										// TODO: Improve this
										console.log('Join server clicked');

										await orpc.server.join.call({ server: targetServerCode }).then((data) => {
											if (!data.success) {
												toast.error(
													`${data.error?.message ?? 'Failed to join, because something went wrong'}`
												);
												console.error('Failed to join server', data.error);
												return;
											}

											emit('updateManorList', null);
											toast.success('Joined server!');
											open = false;
										});
									}}
								>
									<span class="flex items-center justify-center gap-2">
										<span>Join Now</span>
										<ArrowRight class="h-4 w-4" />
									</span>
								</button>
							</div>

							<!-- Help Text -->
							<div class="mt-4 text-center">
								<p class="text-muted/70 text-xs">
									Example: <span class="text-muted">spookcord.app/join/yourinvite</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Bottom Section -->
				<div class="border-separator/30 mt-8 border-t pt-6">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
							<p class="text-muted/80 text-sm">New to servers? We'll guide you through</p>
						</div>
						<button
							class="text-primary hover:text-primary/80 text-sm font-medium transition-all duration-200 hover:underline"
						>
							Learn More
						</button>
					</div>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<CreateServerPopup bind:open={showingCreationUI} />
