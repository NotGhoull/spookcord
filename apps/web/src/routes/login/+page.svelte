<script lang="ts">
	import { page } from '$app/stores';
	import SignInForm from '../../components/SignInForm.svelte';
	import SignUpForm from '../../components/SignUpForm.svelte';

	const showSignIn = $state(true);

	const redirectsTo = $page.url.searchParams.get('redirect');
	const reason = $page.url.searchParams.get('reason');
	console.log(redirectsTo, reason);
</script>

<!-- {#if showSignIn}
	<SignInForm switchToSignUp={() => showSignIn = false} />
{:else}
	<SignUpForm switchToSignIn={() => showSignIn = true} />
{/if} -->

<!-- <SignInForm switchToSignUp={() => {}}></SignInForm>/> -->
<SignInForm />
