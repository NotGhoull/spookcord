<script>
	import { AlertTriangle, ChevronDown, RefreshCw, RotateCcw } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';

	const { children } = $props();
</script>

<svelte:boundary>
	{@render children()}

	{#snippet failed(error, reset)}
		<div
			class="bg-background flex min-h-screen items-center justify-center p-6"
			transition:fly={{ y: -20, duration: 450 }}
		>
			<div class="relative w-full max-w-2xl">
				<!-- Background Effects -->
				<div class="absolute inset-0 overflow-hidden rounded-3xl">
					<div
						class="bg-primary/10 animate-pulse-glow absolute top-12 left-12 h-32 w-32 rounded-full blur-3xl"
					></div>
					<div
						class="bg-secondary/10 animate-pulse-glow absolute right-16 bottom-16 h-24 w-24 rounded-full blur-2xl"
						style="animation-delay: 1.5s;"
					></div>
					<div
						class="bg-primary/5 animate-pulse-glow absolute top-1/2 left-1/4 h-16 w-16 rounded-full blur-xl"
						style="animation-delay: 3s;"
					></div>
				</div>

				<!-- Main Error Card -->
				<div
					class="bg-card/80 border-separator/30 relative rounded-3xl border p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
				>
					<!-- Pattern Overlay -->
					<div
						class="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_1px,_transparent_1px)] bg-[length:32px_32px] opacity-5"
					></div>

					<div class="relative z-10">
						<!-- Error Icon -->
						<div class="mb-8 flex justify-center">
							<div class="relative">
								<div
									class="bg-primary/20 animate-pulse-glow absolute inset-0 rounded-2xl blur-lg"
								></div>
								<div class="from-primary to-primary/80 relative rounded-2xl bg-gradient-to-br p-6">
									<AlertTriangle class="animate-float h-12 w-12 text-white" />
								</div>
							</div>
						</div>

						<!-- Error Content -->
						<div class="space-y-6 text-center">
							<div class="space-y-3">
								<h1 class="text-foreground text-4xl font-bold tracking-tight">
									Oops! Something Went Wrong
								</h1>
								<p class="text-muted mx-auto max-w-md leading-relaxed">
									We encountered an unexpected error. Don't worry, we're on it!
								</p>
							</div>

							<!-- Error Details (Collapsible) -->
							<details
								class="group bg-input-bg/30 border-separator/30 rounded-xl border p-4 text-left"
							>
								<summary
									class="text-muted hover:text-foreground flex cursor-pointer items-center justify-between text-sm font-medium transition-colors duration-200"
								>
									<span>Technical Details</span>
									<ChevronDown
										class="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
									/>
								</summary>
								<div class="border-separator/20 mt-4 border-t pt-4">
									<pre
										class="text-muted/80 bg-background/50 max-h-32 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">{error}</pre>
								</div>
							</details>

							<!-- Action Buttons -->
							<div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
								<button
									onclick={reset}
									class="group from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl bg-gradient-to-r px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_-6px_rgba(255,102,0,0.4)] active:scale-[0.98]"
								>
									<span class="flex items-center justify-center gap-2">
										<RotateCcw
											class="h-5 w-5 transition-transform duration-500 group-hover:-rotate-360"
										/>
										<span>Try Again</span>
									</span>
								</button>

								<button
									onclick={() => window.location.reload()}
									class="bg-button hover:bg-button-hover text-foreground border-separator/30 rounded-xl border px-8 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
								>
									<span class="flex items-center justify-center gap-2">
										<RefreshCw class="h-5 w-5" />
										<span>Reload Page</span>
									</span>
								</button>
							</div>

							<!-- Help Section -->
							<div class="border-separator/20 border-t pt-6">
								<div class="flex items-center justify-center gap-4 text-sm">
									<div class="text-muted/70 flex items-center gap-2">
										<div class="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
										<span>Need help?</span>
									</div>
									<div class="flex gap-4">
										<button
											class="text-primary hover:text-primary/80 transition-all duration-200 hover:underline"
										>
											Contact Support
										</button>
										<span class="text-separator">•</span>
										<button
											class="text-primary hover:text-primary/80 transition-all duration-200 hover:underline"
										>
											Report Bug
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Floating Elements for Visual Interest -->
				<div
					class="bg-primary/20 animate-float absolute -top-4 -left-4 h-8 w-8 rounded-full"
					style="animation-delay: 0.5s;"
				></div>
				<div
					class="bg-secondary/20 animate-float absolute -right-6 -bottom-6 h-12 w-12 rounded-full"
					style="animation-delay: 2s;"
				></div>
				<div
					class="bg-primary/15 animate-float absolute top-1/3 -right-8 h-6 w-6 rounded-full"
					style="animation-delay: 1s;"
				></div>
			</div>
		</div>
	{/snippet}
</svelte:boundary>
