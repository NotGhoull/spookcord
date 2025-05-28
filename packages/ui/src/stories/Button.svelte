<script lang="ts" module>
	import { tv } from 'tailwind-variants';
	import type { WithElementRef } from 'bits-ui';
	import '../app.css';
	import type { VariantProps } from 'tailwind-variants';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export const buttonVariants = tv({
		base: 'cursor-pointer ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				primary:
					'bg-primary text-white hover:bg-primary/90 shadow-[0_5px_15px_rgba(255,102,0,0.2)] hover:shadow-[0_8px_20px_rgba(255,102,0,0.3)]',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground border',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent/20 hover:text-accent',
				link: 'text-primary underline-offset-4 hover:underline',
				gradient:
					'bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary shadow-[0_12px_24px_-6px_rgba(255,102,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300'
			},
			size: {
				sm: 'h-9 rounded-md px-3',
				default: 'h-10 px-4 py-2',
				icon: 'h-10 w-10',
				lg: 'h-11 rounded-md px-8 text-md'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
	export type ButtonProps = WithElementRef<HTMLButtonAttributes> & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		icon?: typeof IconComponentType;
		iconPosition?: 'left' | 'right';
		fullWidth?: boolean;
		href?: string;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Icon as IconComponentType } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable<HTMLAnchorElement | HTMLButtonElement | null>(null),
		type = 'button',
		icon: iconComponent,
		iconPosition = 'left',
		fullWidth = false,
		href = undefined,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<button
	bind:this={ref}
	class={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
	{type}
	onclick={() => {
		if (href) {
			goto(href);
		}
	}}
	{...restProps}
>
	{#if iconComponent && iconPosition == 'left'}
		<svelte:component this={iconComponent} class="size-4 shrink-0" />
	{/if}

	{@render children?.()}

	{#if iconComponent && iconPosition == 'right'}
		<svelte:component this={iconComponent} class="size-4 shrink-0" />
	{/if}
</button>
