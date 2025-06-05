<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Avatar from '$lib/components/Avatar.svelte';

	const { Story } = defineMeta({
		title: 'Experimental/Avatar',
		component: Avatar,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		pfp: 'https://cdn.discordapp.com/avatars/536225818054230017/5bb30e5c8579484b1d1e28fc22863b75.webp?size=1024',
		alt: 'alt'
	}}
/>
