<script lang="ts">
	import { onMount } from 'svelte';
	import { isMemberViewVisible } from '$lib/localStates/sidebar';
	import { HomeIcon, Settings } from '@lucide/svelte';
	import ServerList from '../../components/Servers/ServerList.svelte';
	import ChannelList from '../../components/Channels/ChannelList.svelte';
	import ChatView from '../../components/Chat/ChatView.svelte';
	import MemberList from '../../components/Members/MemberList.svelte';
	import { fly, fade, scale, crossfade } from 'svelte/transition';
	import { quintOut, expoOut } from 'svelte/easing';
	import UserSettingsLayout from '../../components/User-Settings/UserSettingsLayout.svelte';
	import { CurrentServer } from '$lib/localStates/chat';

	let isMobile: boolean = $state(false);
	let activeView: 'servers' | 'channels' | 'chat' | 'members' | 'home' = $state('chat');
	let showSettings: boolean = $state(true);
	let memberVisibility = $state(true);

	// Create crossfade transition for smooth server switching with layout preservation
	const [send, receive] = crossfade({
		duration: 400,
		easing: quintOut,
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;
			return {
				duration: 400,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${0.8 + t * 0.2}) translateY(${(1 - t) * 20}px);
					opacity: ${t};
				`
			};
		}
	});

	// Smooth panel entrance with proper width handling
	function panelEntrance(node: any, { delay = 0, duration = 400 } = {}) {
		return {
			delay,
			duration,
			easing: quintOut,
			css: (t: any) => `
				transform: translateX(${(1 - t) * -50}px) scale(${0.95 + t * 0.05});
				opacity: ${t};
				filter: blur(${(1 - t) * 4}px);
			`
		};
	}

	// Smooth panel exit
	function panelExit(node: any, { duration = 300 } = {}) {
		return {
			duration,
			easing: quintOut,
			css: (t: any) => `
				transform: translateX(${(1 - t) * -30}px) scale(${0.95 + t * 0.05});
				opacity: ${t};
				filter: blur(${(1 - t) * 2}px);
			`
		};
	}

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
				in:panelEntrance={{ delay: 0 }}
				out:panelExit
				style="min-width: 0; transform-origin: left center;"
			>
				<div class="h-full" in:fade={{ delay: 150, duration: 300 }}>
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
					in:send={{ key: 'main-content' }}
					out:receive={{ key: 'main-content' }}
				>
					<div
						class="flex h-full w-full items-center justify-center"
						in:fly={{ y: 30, duration: 500, delay: 200, easing: quintOut }}
					>
						<div
							class="flex flex-col items-center justify-center space-y-4 rounded-xl p-4 text-center"
						>
							<div
								class="text-center text-6xl font-light opacity-80"
								in:scale={{ duration: 600, delay: 300, easing: quintOut, start: 0.8 }}
							>
								<HomeIcon class="size-16" />
							</div>
							<h1
								class="text-3xl font-semibold tracking-tight"
								in:fly={{ y: 20, duration: 400, delay: 400, easing: quintOut }}
							>
								Welcome Home
							</h1>
							<p
								class="text-muted-foreground text-lg"
								in:fly={{ y: 20, duration: 400, delay: 500, easing: quintOut }}
							>
								This is where your dms will be, but I haven't implemented them yet
							</p>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="flex flex-1 gap-4 transition-all duration-400 ease-out"
					in:send={{ key: 'main-content' }}
					out:receive={{ key: 'main-content' }}
				>
					{#if !isMobile || activeView === 'channels'}
						<div
							class="border-separator/20 bg-channel-list/80 h-full overflow-hidden rounded-2xl border shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-md"
							class:w-full={isMobile && activeView === 'channels'}
							class:w-0={isMobile && activeView !== 'channels'}
							class:w-64={!isMobile}
							style="min-width: 0; transform-origin: left center; transition: width 0.4s ease-out;"
						>
							<div in:fade={{ delay: 200, duration: 300 }}>
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
						>
							<div
								class="h-full"
								in:fade={{ delay: 300, duration: 400 }}
								out:fade={{ duration: 200 }}
							>
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
					in:panelEntrance={{ delay: 300 }}
					out:panelExit
					style="min-width: 0; transform-origin: right center;"
				>
					<div in:fade={{ delay: 350, duration: 300 }}>
						<MemberList />
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<UserSettingsLayout open={showSettings} />

	<!-- <UserSettingsLayout /> -->
</div>

<style>
	/* Enhanced backdrop blur and smooth transitions */
	.bg-sidebar\/80,
	.bg-channel-list\/80,
	.bg-chat-area\/80,
	.bg-members-list\/80 {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Subtle hover effects for interactive elements */
	.bg-sidebar\/80:hover,
	.bg-channel-list\/80:hover,
	.bg-members-list\/80:hover {
		backdrop-filter: blur(20px);
		border-color: rgba(255, 255, 255, 0.1);
	}

	/* Enhanced shadow animations */
	.shadow-\[0_0_20px_rgba\(0\,0\,0\,0\.4\)\],
	.shadow-\[0_0_25px_rgba\(0\,0\,0\,0\.5\)\],
	.shadow-\[0_0_30px_rgba\(0\,0\,0\,0\.5\)\] {
		transition: box-shadow 0.3s ease;
	}

	/* Smooth transform origins for better animations */
	[style*='transform-origin'] {
		will-change: transform, opacity;
	}
</style>
