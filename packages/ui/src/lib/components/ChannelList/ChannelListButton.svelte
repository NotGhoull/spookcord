<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils.js';
	import { HashIcon } from '@lucide/svelte';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export const channelListVaraints = tv({
		base: 'group relative flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
		variants: {
			variant: {
				default: 'text-muted hover:bg-button/50 hover:text-foreground',
				selected: 'bg-button text-primary shadow-[0_0_8px_rgba(255,107,0,0.1)]'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type ChannelListButtonVariants = VariantProps<typeof channelListVaraints>['variant'];
	export type ChannelListButtonProps = WithElementRef<HTMLButtonAttributes> & {
		name: string;
		selected?: boolean;
	};
</script>

<script lang="ts">
	let { selected, name }: ChannelListButtonProps = $props();
	let shownVariant: ChannelListButtonVariants = $derived(selected ? 'selected' : 'default');
</script>

<button class={cn(channelListVaraints({ variant: shownVariant }))}>
	{#if selected}
		<span class="border-primary/10 absolute inset-0 rounded-xl border"></span>
	{/if}

	<HashIcon
		class="group-hover:text-primary size-5 shrink-0 opacity-70 transition-colors duration-200"
	/>
	<span class="group-hover:text-primary truncate transition-colors duration-200"
		>{name ?? 'ERROR! NO NAME!'}</span
	>
</button>
