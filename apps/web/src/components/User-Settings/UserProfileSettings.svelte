<script>
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { CameraIcon } from '@lucide/svelte';
</script>

<ScrollArea class="h-full">
	<div class="p-6">
		<div class="mb-6">
			<h2 class="text-primary text-2xl font-bold">My Account</h2>
			<p class="text-muted text-sm">Manage your profile and account settings</p>
		</div>

		<div class="space-y-8">
			<!-- Profile section -->
			<div
				class="border-separator/20 bg-card/30 overflow-hidden rounded-xl border shadow-[0_0_15px_rgba(0,0,0,0.15)] backdrop-blur-sm"
			>
				<div class="border-separator/20 border-b p-4">
					<h3 class="text-primary font-medium">Profile</h3>
				</div>

				<div class="p-6">
					<div class="flex flex-col gap-6 md:flex-row">
						<!-- Avatar -->
						<div class="flex flex-col items-center gap-3">
							<div class="relative">
								<div
									class="bg-primary group flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-[0_0_15px_rgba(0,0,0,0.2)]"
								>
									<img
										src="https://cdn.discordapp.com/avatars/536225818054230017/5bb30e5c8579484b1d1e28fc22863b75.webp?size=1024"
										alt="You!"
										class="h-full w-full rounded-2xl"
									/>
									<!-- TODO: Make it so when the image is hovered it moves off to the side and shows a camera button -->
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</ScrollArea>
