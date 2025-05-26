<script lang="ts">
	import { page } from '$app/state';
	import SignInForm from '../../components/SignInForm.svelte';

	// Swap to using page instead of $page, since its deprecated
	const redirectsTo = page.url.searchParams.get('redirect');
	const reason = page.url.searchParams.get('reason');
	console.log(redirectsTo, reason);
</script>

<SignInForm redirect={redirectsTo} urlError={reason} />
