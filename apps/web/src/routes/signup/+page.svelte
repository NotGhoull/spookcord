<script lang="ts">
	import { page } from '$app/state';
	import SignUpForm from '../../components/SignUpForm.svelte';

	const redirect = page.url.searchParams.get('redirect');
</script>

<SignUpForm {redirect} />
