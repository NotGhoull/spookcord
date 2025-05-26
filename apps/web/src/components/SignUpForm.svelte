<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { LockIcon, MailIcon, User } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { z } from 'zod';
	import SpookCordLogo from './SpookCordLogo.svelte';
	import InputItem from './LoginSignup/InputItem.svelte';
	import ErrorMessage from './LoginSignup/ErrorMessage.svelte';

	const { redirect }: { redirect?: string | null } = $props();

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
						goto(redirect ?? '/chat');
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
						<!-- {@render inputItem(field, 'Username', 'name', 'NotNotGhoul_', 'username', User)} -->
						<InputItem
							{field}
							name="Username"
							initialInputType="name"
							placeholder="NotNotGhoul_"
							autocomplete="username"
							icon={User}
						/>
					{/snippet}
				</form.Field>
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

				<form.Field name="confirm">
					{#snippet children(field)}
						<InputItem
							{field}
							name="Confirm password"
							initialInputType="password"
							placeholder="Password, but again"
							autocomplete="current-password"
							icon={LockIcon}
							password
						/>
					{/snippet}
				</form.Field>

				<form.Subscribe>
					{#snippet children(state)}
						{#if state.isSubmitSuccessful}
							<ErrorMessage message="Something went wrong while trying to sign up" />
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
			<span class="text-muted">Already have an account?</span>
			<a class="text-accent" href={`/login?${redirect ? `redirect=${redirect}` : ''}`}>Sign in</a>
		</div>
	</div>
</div>
