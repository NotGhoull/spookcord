<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Component,
		EyeIcon,
		Icon,
		LockIcon,
		MailIcon,
		TriangleAlert,
		User
	} from '@lucide/svelte';
	import { createForm, Field } from '@tanstack/svelte-form';
	import type { AnyFieldApi } from '@tanstack/svelte-form';
	import { z } from 'zod';
	import SpookCordLogo from './SpookCordLogo.svelte';
	import type { ErrorContext } from 'better-auth/svelte';
	import type { FullAutoFill } from 'svelte/elements';
	import { blur, slide } from 'svelte/transition';

	const { switchToSignUp } = $props<{ switchToSignUp: () => void }>();

	let error = $state<undefined | ErrorContext>();

	const validationSchema = z
		.object({
			name: z.string().min(2, 'Name must be at least 2 characters'),
			email: z.string().email('Invalid email address'),
			password: z.string().min(8, 'Password must be at least 8 characters'),
			confirm: z.string()
		})
		.refine((data) => data.password === data.confirm, {
			message: "Passwords don't match",
			path: ['confirm']
		});

	const form = createForm(() => ({
		defaultValues: { name: '', email: '', password: '', confirm: '' },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name
				},
				{
					onSuccess: () => {
						goto('/chat');
					},
					onError: (error) => {
						console.log(error.error.message || 'Sign up failed, unknown error');
					}
				}
			);
		},
		validators: {
			onSubmit: validationSchema
		}
	}));
</script>

<div class="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
	<div class="w-full max-w-md space-y-8">
		<div class="flex flex-col items-center space-y-2 text-center">
			<div class="relative flex h-16 w-16 items-center justify-center">
				<div
					class="animate-pulse-glow bg-accent absolute h-full w-full rounded-full opacity-30 blur-md"
				></div>

				<div
					class="bg-sidebar relative flex h-full w-full items-center justify-center rounded-full"
				>
					<div
						class="bg-accent relative flex h-full w-full items-center justify-center rounded-full"
					>
						<SpookCordLogo />
					</div>
				</div>
			</div>
			<h1 class="text-3xl font-bold tracking-tight">Ready to make an account?</h1>
			<p class="text-muted text-sm">Join us, on the spookiest chat platform around</p>
		</div>

		<div class="bg-card relative border-separate rounded-lg border p-6 shadow-lg backdrop-blur-sm">
			<form
				class="space-y-6"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					console.log('Submit!');
					form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{#snippet children(field)}
						{@render inputItem(field, 'Username', 'name', 'NotNotGhoul_', 'username', User)}
					{/snippet}
				</form.Field>
				<form.Field name="email">
					{#snippet children(field)}
						{@render inputItem(field, 'Email', 'email', 'you@spookcord.app', 'email', MailIcon)}
					{/snippet}
				</form.Field>
				<form.Field name="password">
					{#snippet children(field)}
						{@render inputItem(
							field,
							'Password',
							'password',
							'password',
							'current-password',
							LockIcon,
							true
						)}
					{/snippet}
				</form.Field>

				<form.Field name="confirm">
					{#snippet children(field)}
						{@render inputItem(
							field,
							'Confirm password',
							'password',
							'Password, but again',
							'current-password',
							LockIcon,
							true
						)}
					{/snippet}
				</form.Field>

				<form.Subscribe>
					{#snippet children(state)}
						{#if state.isSubmitSuccessful}
							{@render errorMessage('Something went wrong while trying to sign up')}
						{/if}
						<Button
							type="submit"
							class="group bg-accent hover:bg-accent/90 relative w-full cursor-pointer text-black"
							disabled={!state.canSubmit}>{state.isSubmitting ? 'Signing up...' : 'Sign up'}</Button
						>
					{/snippet}
				</form.Subscribe>
			</form>
		</div>

		<div class="text-center text-sm">
			<span class="text-muted">Don't have an account?</span>
			<span class="text-accent">Sign up</span>
		</div>
	</div>
</div>

{#snippet inputItem(
	field: AnyFieldApi,
	name: string,
	inputType: string,
	placeholder: string,
	autocomplete: FullAutoFill,
	icon: typeof Icon,
	password?: boolean
)}
	<div class="space-y-2">
		<Label for={field.name}>{name}</Label>
		<div class="relative">
			<!-- I know this is depreicated, but it works -->
			<!-- svelte-ignore svelte_component_deprecated -->
			<svelte:component this={icon} class="text-muted absolute top-2.5 left-3 h-5 w-5" />

			<Input
				id={field.name}
				name={field.name}
				type={inputType}
				{placeholder}
				{autocomplete}
				class="placeholder:text-muted pl-10"
				onblur={field.handleBlur}
				value={field.state.value}
				oninput={(e: Event) => {
					const target = e.target as HTMLInputElement;
					field.handleChange(target.value);
				}}
			/>

			{#if password}
				<button class="text-muted hover:text-foreground absolute top-2.5 right-3">
					<EyeIcon class="h-5 w-5" />
				</button>
			{/if}
		</div>
		{#each field.state.meta.errors as error}
			{@render errorMessage(error.message ?? 'Unkown error')}
		{/each}
	</div>
{/snippet}

{#snippet errorMessage(message: string)}
	<div
		class="flex w-full flex-row gap-1 align-middle text-sm text-red-500"
		transition:slide={{ axis: 'y', duration: 680 }}
	>
		<TriangleAlert size="18" />
		<p>{message}</p>
	</div>
{/snippet}
