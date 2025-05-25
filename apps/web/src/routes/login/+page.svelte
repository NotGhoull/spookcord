<script lang="ts">
	import SignInForm from '../../components/SignInForm.svelte';
	import SignUpForm from '../../components/SignUpForm.svelte';

	const showSignIn = $state(true);
</script>

<!-- {#if showSignIn}
	<SignInForm switchToSignUp={() => showSignIn = false} />
{:else}
	<SignUpForm switchToSignIn={() => showSignIn = true} />
{/if} -->

<!-- <SignInForm switchToSignUp={() => {}}></SignInForm>/> -->
<SignInForm switchToSignUp={() => {}} />
