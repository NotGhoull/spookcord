<script lang="ts">
	import { onMount } from 'svelte';
	import { isMemberViewVisible } from '$lib/localStates/sidebar';
	import { HomeIcon } from '@lucide/svelte';
	import ServerList from '../../components/Servers/ServerList.svelte';
	import ChannelList from '../../components/Channels/ChannelList.svelte';
	import ChatView from '../../components/Chat/ChatView.svelte';
	import MemberList from '../../components/Members/MemberList.svelte';
	import { fade } from 'svelte/transition'; // Import crossfade
	import UserSettingsLayout from '../../components/User-Settings/UserSettingsLayout.svelte';
	import { CurrentServer } from '$lib/localStates/chat';

	let isMobile: boolean = $state(false);
	let activeView: 'servers' | 'channels' | 'chat' | 'members' | 'home' = $state('chat');
	let showSettings: boolean = $state(true);
	let memberVisibility = $state(true); // Create crossfade transition

	isMemberViewVisible.subscribe((data) => {
		memberVisibility = data;
	});

	onMount(() => {
		const checkMobile = () => window.innerWidth < 768;

		isMobile = checkMobile();

		window.addEventListener('resize', () => {
			isMobile = checkMobile();
			console.log(isMobile);
		});
	});

	const handleServerClick = (serverId: string) => {
		activeView = 'chat';
	};
</script>

<div
	class="bg-background text-foreground relative flex h-screen w-full overflow-hidden p-4"
	id="SPOOKCORD_PORTAL_BASE"
>
	<div class="relative z-10 flex h-full w-full gap-4">
		{#if !isMobile || activeView == 'servers'}
			<div
				class="border-separator/20 bg-sidebar/80 h-full overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-500 ease-out"
				class:w-full={isMobile && activeView === 'servers'}
				class:w-0={isMobile && activeView !== 'servers'}
				class:w-[88px]={!isMobile}
				in:fade={{ duration: 300 }}
				style="min-width: 0; transform-origin: left center;"
			>
				<div class="h-full">
					<ServerList />
				</div>
			</div>
		{/if}
		<div
			class="flex flex-1 gap-4 transition-all duration-400 ease-out"
			class:w-full={isMobile &&
				($CurrentServer === 'HOME' || activeView === 'channels' || activeView === 'chat')}
			class:w-0={isMobile && activeView === 'servers'}
			style="min-width: 0;"
		>
			{#if $CurrentServer === 'HOME'}
				<div
					class="border-separator/20 bg-chat-area/80 relative h-full w-full overflow-hidden rounded-2xl border shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-400 ease-out"
					in:fade
				>
					<div class="flex h-full w-full items-center justify-center">
						<div
							class="flex flex-col items-center justify-center space-y-4 rounded-xl p-4 text-center"
						>
							<div class="text-center text-6xl font-light opacity-80">
								<HomeIcon class="size-16" />
							</div>
							<h1 class="text-3xl font-semibold tracking-tight">Welcome Home</h1>
							<p class="text-muted-foreground text-lg">
								This is where your dms will be, but I haven't implemented them yet
							</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex flex-1 gap-4 transition-all duration-400 ease-out">
					{#if !isMobile || activeView === 'channels'}
						<div
							class="border-separator/20 bg-channel-list/80 h-full overflow-hidden rounded-2xl border shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-md"
							class:w-full={isMobile && activeView === 'channels'}
							class:w-0={isMobile && activeView !== 'channels'}
							class:w-64={!isMobile}
							in:fade={{ duration: 300 }}
							style="min-width: 0; transform-origin: left center; transition: width 0.4s ease-out;"
						>
							<div class="h-full">
								<ChannelList />
							</div>
						</div>
					{/if}

					{#if !isMobile || activeView === 'chat'}
						<div
							class="border-separator/20 bg-chat-area/80 relative h-full flex-1 overflow-hidden rounded-2xl border shadow-[0_0_25px_rgba(0,0,0,0.5)] backdrop-blur-md"
							class:w-full={isMobile && activeView === 'chat'}
							class:w-0={isMobile && activeView !== 'chat'}
							style="min-width: 0; transform-origin: center; transition: all 0.4s ease-out;"
							in:fade={{ duration: 300 }}
						>
							<div class="h-full">
								<ChatView />
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if $CurrentServer !== 'HOME'}
			{#if memberVisibility && (!isMobile || activeView === 'members')}
				<div
					class="border-separator/20 bg-members-list/80 h-full overflow-hidden rounded-2xl border shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 ease-out"
					class:w-full={isMobile && activeView === 'members'}
					class:w-0={isMobile && activeView !== 'members'}
					class:w-64={!isMobile}
					in:fade={{ duration: 300 }}
					style="min-width: 0; transform-origin: right center;"
				>
					<div class="h-full">
						<MemberList />
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<UserSettingsLayout open={showSettings} />
</div>
