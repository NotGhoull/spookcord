<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { EyeIcon, Icon, LockIcon, MailIcon, TriangleAlert } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import type { AnyFieldApi } from '@tanstack/svelte-form';
	import { z } from 'zod';
	import SpookCordLogo from './SpookCordLogo.svelte';
	import type { FullAutoFill } from 'svelte/elements';
	import { slide } from 'svelte/transition';
	import type { ErrorContext } from 'better-auth/svelte';

	let error = $state<ErrorContext>();

	const validationSchema = z.object({
		email: z.string().email('Invalid email address'),
		password: z.string().min(1, 'Password is required')
	});

	const form = createForm(() => ({
		defaultValues: { email: '', password: '' },
		onSubmit: async ({ value }) => {
			console.log('FORM TRIGGERED!');
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onSuccess: () => goto('/chat'),
					onError: (_error) => {
						// Despite the type saying it'll always be error context, it won't always be defined

						if (typeof _error == 'undefined') {
							_error = error as ErrorContext;
							console.log('error!', _error.error ?? 'Incorrect username or password, I guess');
							return;
						}
						console.log('Incorrect username or password, probably');
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
			<h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
			<p class="text-muted text-sm">Sign in to your <b>SpookCord</b> account</p>
		</div>

		<div class="bg-card relative border-separate rounded-lg border p-6 shadow-lg backdrop-blur-sm">
			<form
				class="space-y-6"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					console.log('Submit!');
					form.handleSubmit({ email: 'a', password: 'a' });
				}}
			>
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

				<form.Subscribe>
					{#snippet children(state)}
						{#if state.isSubmitSuccessful}
							{@render errorMessage(error?.response.statusText ?? 'Incorrect username or password')}
						{/if}
						<Button
							type="submit"
							class="group bg-accent hover:bg-accent/90 relative w-full cursor-pointer text-black"
							disabled={!state.canSubmit}>{state.isSubmitting ? 'Signing in...' : 'Sign in'}</Button
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
