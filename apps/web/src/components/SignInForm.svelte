<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle, LockIcon, MailIcon } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { z } from 'zod';
	import SpookCordLogo from './SpookCordLogo.svelte';
	import type { ErrorContext } from 'better-auth/svelte';
	import ErrorMessage from './LoginSignup/ErrorMessage.svelte';
	import InputItem from './LoginSignup/InputItem.svelte';

	const { redirect, urlError }: { redirect?: string | null; urlError?: string | null } = $props();

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
					onSuccess: () => goto(redirect ?? '/chat'),
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

		<div
			class="bg-card relative flex border-separate flex-col gap-2 rounded-lg border p-6 shadow-lg backdrop-blur-sm"
		>
			{#if urlError == 'unauthorized'}
				<div class="flex w-full items-center justify-center gap-2 text-red-500">
					<AlertCircle class="h-5 w-5" />
					<p>You need to be signed in to view this page</p>
				</div>
			{/if}
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
						<InputItem
							{field}
							name="Email"
							initialInputType="email"
							placeholder="you@spookcord.app"
							autocomplete="email"
							icon={MailIcon}
						/>
					{/snippet}
				</form.Field>
				<form.Field name="password">
					{#snippet children(field)}
						<InputItem
							{field}
							name="Password"
							initialInputType="password"
							placeholder="password"
							autocomplete="current-password"
							icon={LockIcon}
							password
						/>
					{/snippet}
				</form.Field>

				<form.Subscribe>
					{#snippet children(state)}
						{#if state.isSubmitSuccessful}
							<ErrorMessage
								message={error?.response.statusText ?? 'Incorrect username or password'}
							/>
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
			<a class="text-accent" href={`/signup?${redirect ? `redirect=${redirect}` : ''}`}>Sign up</a>
		</div>
	</div>
</div>
