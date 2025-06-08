<script lang="ts" module>
	import ChannelListButton from '$lib/components/ChannelList/ChannelListButton.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Channel List/Button',
		component: ChannelListButton,
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{ name: 'Example channel', selected: false }} />
<Story name="Selected" args={{ name: 'Example channel', selected: true }} />
