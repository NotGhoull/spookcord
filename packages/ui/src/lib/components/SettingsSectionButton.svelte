<script module lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Icon as IconComponent } from '@lucide/svelte';

	export const settingsSectionButtonVaraints = tv({
		base: 'flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
		variants: {
			variant: {
				default: 'text-muted hover:bg-button/50 hover:text-foreground',
				selected: 'bg-primary/20 text-primary',
				destructive: 'text-background bg-destructive'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type settingsSectionButtonVaraint = VariantProps<
		typeof settingsSectionButtonVaraints
	>['variant'];
	export type SettingsSectionButtonProps = WithElementRef<HTMLButtonAttributes> & {
		variant?: settingsSectionButtonVaraint;
		label: string;
		selected?: boolean;
		icon?: typeof IconComponent;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		label,
		selected = false,
		variant,
		icon,
		...restProps
	}: SettingsSectionButtonProps = $props();

	const currentVariant = $derived(selected ? 'selected' : variant);
</script>

<button
	aria-label={label}
	class={cn(settingsSectionButtonVaraints({ variant: currentVariant }), className)}
	{...restProps}
>
	<svelte:component this={icon} class="h-5 w-5" />
	<span>{label}</span>
</button>
