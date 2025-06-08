<script>
	import { Button } from '$lib/components/ui/button';
	import { orpc } from '$lib/orpc';
	import { SettingsIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let username = $state();

	onMount(async () => {
		await orpc.getUserById.call({}).then((data) => {
			if (!data) {
				console.log('User is Undefined');
				return;
			}
			username = data.name;
		});
	});
</script>

<div
	class="group from-input-bg/70 to-input-bg/40 text-muted relative mb-1 flex h-14 w-14 max-w-fit items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br p-2 text-sm shadow-lg transition-all duration-300 hover:w-full"
>
	<div
		class="pointer-events-none absolute inset-0 z-0 scale-150 rounded-xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 opacity-0 transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100"
	></div>

	<img
		src="https://cdn.discordapp.com/avatars/536225818054230017/5bb30e5c8579484b1d1e28fc22863b75.webp?size=1024"
		class="group-hover:ring-offset-input-bg relative z-10 h-10 w-10 rounded-full object-cover shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-400 group-hover:ring-offset-2"
		alt="You!"
	/>

	<div class="relative z-10 flex flex-1 flex-col justify-center whitespace-nowrap">
		<p class="font-semibold text-white transition-colors duration-200 group-hover:text-blue-200">
			NotGhoul_
		</p>
		<p class="text-xs text-gray-300 transition-colors duration-200 group-hover:text-gray-200">
			hehehaw
		</p>
	</div>

	<button
		onclick={() => {
			toast.warning('User settings area is disabled in this build (Unfinished)');
		}}
		class="relative z-10 ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 p-1 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100 group-[&:not(:hover)]:scale-0 group-[&:not(:hover)]:rotate-180"
	>
		<SettingsIcon class="h-5 w-5" />
	</button>
</div>

<style>
	/* Example of how you might add custom animations if needed,
     though Tailwind's utility classes are often sufficient.
     For this, we're relying mostly on transition properties.
  */
</style>
