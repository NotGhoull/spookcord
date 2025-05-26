<script lang="ts">
	import { CurrentChannel, CurrentServer } from '$lib/localStates/chat';
	import JoinServerPopup from './JoinServerPopup.svelte';
	import SpookCordLogo from '../SpookCordLogo.svelte';

	const { selfId, isAddButton = false }: { selfId: string; isAddButton?: boolean } = $props();

	let showJoin = $state(false);

	const isActive = $derived.by(() => {
		if (isAddButton && $CurrentServer !== 'HOME') {
			return;
		}

		if ($CurrentServer === selfId) {
			return true;
		}
		return false;
	});

	const hasNotification = false;
</script>

<button
	onclick={() => {
		if (isAddButton) {
			showJoin = true;
			return;
		}
		console.log('UPDATED TO ', selfId);
		CurrentServer.set(selfId);
	}}
	class={`group relative flex h-14 w-14 cursor-pointer items-center justify-center transition-all duration-300 ${
		isActive
			? 'bg-accent scale-105 rounded-2xl shadow-[0_0_15px_rgba(255,107,0,0.3)]'
			: 'bg-button/70 hover:bg-button rounded-[20px] hover:scale-105 hover:rounded-2xl hover:shadow-[0_0_10px_rgba(255,107,0,0.15)]'
	}`}
>
	<!-- Border overlay -->
	<div
		class={`border-separator/20 absolute inset-0 rounded-[20px] border opacity-0 transition-all duration-300 ${isActive ? 'rounded-2xl opacity-100' : 'group-hover:rounded-2xl group-hover:opacity-100'}`}
	></div>

	<!-- Glow effect -->
	<div
		class={`bg-accent absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`}
	></div>

	<!-- Notification -->
	{#if hasNotification}
		<span
			class="bg-accent absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black"
		>
			!
		</span>
	{/if}

	<!-- Icon -->
	<!-- 👻 -->
	<span class="relative text-2xl transition-transform duration-300 hover:scale-110">
		{#if selfId == 'HOME'}
			<SpookCordLogo width="56" height="56" />
		{:else}
			{selfId.slice(0, 2)}
		{/if}
	</span>
</button>

<JoinServerPopup bind:open={showJoin} />
