<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { CurrentServer } from '$lib/localStates/chat';
	import { orpc } from '$lib/orpc';
	import { Search, Shield } from '@lucide/svelte';
	import { onMount } from 'svelte'; // onMount is not strictly needed for the CurrentServer subscription, but kept for general awareness if other onMount logic is added.

	// Define interfaces for better type safety and readability (if using TypeScript)
	/**
	 * @typedef {object} Member
	 * @property {string} id
	 * @property {string} name
	 * @property {string} avatar
	 * @property {string} color
	 * @property {string} statusText
	 * @property {Array<{ id: string; name: string; icon: string }>} badges
	 */

	/**
	 * @typedef {object} Role
	 * @property {string} id
	 * @property {string} name
	 * @property {string} color
	 * @property {Member[]} members
	 */

	/** @type {Role[]} */
	let roles = $state([
		{
			id: 'default',
			name: 'Default',
			color: '#ff6b00',
			members: [
				// Example member, typically this would be fetched from the server
				{
					id: 'notghoul-id', // Added ID for consistency
					name: 'NotGhoul',
					avatar: 'No',
					color: '#ff6b00',
					statusText: 'Hello, default world!',
					badges: [{ id: 'developer', name: 'Developer', icon: 'CUSTOM_developer' }]
				}
			]
		}
	]);

	$inspect(roles);

	let search = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const filteredRoles = $derived(() => {
		if (!roles || roles.length === 0) return [];

		const lowerCaseSearch = search.toLowerCase();

		return roles
			.map((role) => {
				const filteredMembers = role.members.filter((member) =>
					member.name.toLowerCase().includes(lowerCaseSearch)
				);
				return {
					...role,
					members: filteredMembers
				};
			})
			.filter((role) => role.members.length > 0);
	});

	// Handle fetching server data
	CurrentServer.subscribe(async (newServerId) => {
		if (!newServerId) {
			// Clear existing roles if no server is selected
			roles = [];
			return;
		}

		isLoading = true;
		error = null; // Clear previous errors

		try {
			await orpc.getServerById.call({ id: newServerId }).then(async (serverData) => {
				if (!serverData) {
					console.warn('No server data received for ID:', newServerId);
					roles = []; // Clear roles if no server data
					return;
				}

				console.log('[DEBUG -> MemberList] Got users: ', serverData.members);

				// Initialize roles with default or fetched server roles
				// For now, we'll keep the single 'default' role and populate its members
				// In a real application, you might fetch specific roles from the serverData
				let newMembers: any = [];
				for (const memberRef of serverData.members) {
					console.log('[DEBUG -> MemberList] Checking ref ', memberRef);
					try {
						await orpc.getUserById.call({ id: memberRef.userId }).then((userData) => {
							if (userData) {
								console.log('[DEBUG -> MembersList] Got member! ', userData);
								newMembers.push({
									id: userData.id, // Ensure member has an ID
									name: userData.name,
									avatar: userData.image || '??', // Use avatar from data if available
									statusText: 'Debug status',
									color: '#ff6b00', // Use user-specific color or default
									badges: [{ id: 'default', name: 'Default', icon: 'CUSTOM_DEFAULT' }]
								});
							} else {
								console.warn('[DEBUG -> MemberList] No userdata for ', memberRef.id);
							}
						});
					} catch (userError) {
						console.error(`Error fetching user data for ID ${memberRef.id}:`, userError);
						// Decide whether to skip this member or add a placeholder
					}
				}

				console.log('new members: ', newMembers);

				// Assuming all fetched members go into the "Default" role for now.
				// If your application has actual roles, you would process `serverData.roles` and assign members accordingly.
				roles = [
					{
						...roles[0], // Keep properties of the default role
						members: newMembers
					}
				];

				console.log('Updated members list for server:', newServerId);
				console.log('Members list updated to: ', roles);
			});
		} catch (err) {
			console.error('Error fetching server or user data:', err);
			error = 'Failed to load server members. Please try again.';
			roles = []; // Clear roles on error
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="flex h-full w-full flex-col">
	<div class="p-3">
		<div class="relative">
			<Search class="text-muted absolute top-2.5 left-3 size-2.5 h-4 w-4" />
			<Input
				placeholder="Search spirits"
				bind:value={search}
				class="border-separator/10 bg-input-bg/50 text-foreground placeholder:text-muted focus-visible:ring-accent/50 focus-visible:border-accent/50 rounded-xl pl-9 text-sm focus-visible:ring-1"
			/>
		</div>
	</div>

	<ScrollArea class="flex-1 px-3">
		{#if isLoading}
			<p>Loading members...</p>
		{:else if error}
			<p class="text-red-500">{error}</p>
		{:else if roles.length > 0}
			{#each roles as role (role.id)}
				<div class="mb-1 px-2">
					<h3 class="text-xs font-semibold" style:color={role.color}>
						{role.name} — {role.members.length}
					</h3>
				</div>

				<div class="space-y-1">
					{#each role.members as member (member.id)}
						<button
							class="group hover:bg-button/50 flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
						>
							<div
								class="relative h-10 w-10 shrink-0 scale-100 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
							>
								<div
									class="absolute inset-0 flex items-center justify-center text-lg"
									style:background-color={member.color || role.color}
								>
									<p>{member.name.slice(0, 2)}</p>
								</div>
							</div>
							<div class="flex flex-col items-start overflow-hidden text-left">
								<div class="flex gap-1">
									<span class="w-full truncate font-medium transition-colors duration-200">
										{member.name}
									</span>
									{#each member.badges as badge (badge.id)}
										{#if badge.id === 'developer'}
											<Shield />
										{:else if badge.id === 'admin'}{/if}
									{/each}
								</div>
								{#if member.statusText}
									<span class="text-muted w-full truncate text-xs">{member.statusText}</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/each}
		{:else}
			<p>No spirits found.</p>
		{/if}
	</ScrollArea>
</div>
