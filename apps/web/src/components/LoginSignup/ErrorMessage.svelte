<script lang="ts">
	import { TriangleAlert } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	const { message }: { message: string } = $props();
</script>

<div
	class="flex w-full flex-row gap-1 align-middle text-sm text-red-500"
	transition:slide={{ axis: 'y', duration: 680 }}
>
	<TriangleAlert size="18" />
	<p>{message}</p>
</div>
