<script lang="ts">
	let { pfp, alt }: { pfp?: string; alt: string } = $props();
</script>

<div
	class="relative h-11 w-11 shrink-0 scale-100 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
	style="background-color: rgb(255, 107, 0);"
>
	<div class="absolute inset-0 flex items-center justify-center text-xl">
		{#if pfp}
			<img src={pfp} {alt} />
		{:else}
			<span>?</span>
		{/if}
	</div>
</div>
