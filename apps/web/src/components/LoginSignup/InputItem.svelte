<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { EyeIcon, EyeOffIcon, type Icon } from '@lucide/svelte';
	import type { AnyFieldApi } from '@tanstack/svelte-form';
	import type { FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements';

	const {
		field,
		name,
		initialInputType,
		placeholder,
		autocomplete,
		icon,
		password
	}: {
		field: AnyFieldApi;
		name: string;
		initialInputType: HTMLInputTypeAttribute;
		placeholder: string;
		autocomplete?: FullAutoFill;
		icon: typeof Icon;
		password?: boolean;
	} = $props();

	let isPasswordShowing = $state(false);

	// Determine actual input type based on password showing state
	let currentInputType = $derived<HTMLInputTypeAttribute>(
		password && isPasswordShowing ? 'text' : initialInputType
	);

	// For accessibility
	let passwordToggleButtonLabel = $derived(isPasswordShowing ? 'Hide message' : 'Show password');

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		field.handleChange(target.value);
	}
</script>

<div class="space-y-2">
	<Label for={field.name}>{name}</Label>
	<div class="relative">
		<!-- I know this is depreicated, but it works -->
		<!-- svelte-ignore svelte_component_deprecated -->
		<svelte:component this={icon} class="text-muted absolute top-2.5 left-3 h-5 w-5" />

		<Input
			id={field.name}
			name={field.name}
			type={currentInputType}
			{placeholder}
			{autocomplete}
			class="placeholder:text-muted pl-10"
			onblur={field.handleBlur}
			value={field.state.value}
			oninput={handleInputChange}
		/>

		{#if password}
			<button
				class="text-muted hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
				type="button"
				aria-label={passwordToggleButtonLabel}
				onclick={() => {
					isPasswordShowing = !isPasswordShowing;
				}}
			>
				{#if isPasswordShowing}
					<EyeOffIcon class="h-5 w-5" />
				{:else}
					<EyeIcon class="h-5 w-5" />
				{/if}
			</button>
		{/if}
	</div>
</div>
