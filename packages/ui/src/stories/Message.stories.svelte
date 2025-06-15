<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Message from '$lib/components/Message.svelte';

	const { Story } = defineMeta({
		title: 'Experimental/Message',
		component: Message,
		tags: ['autodocs'],
		argTypes: {
			username: {
				description: 'The username of the user'
			},
			text: {
				description: 'The message sent'
			},
			pfp: {
				control: 'file',
				description: 'The profile picture of the user'
			},

			createdAt: {
				control: 'date',
				description: 'The date the message was created at'
			},
			lastEdited: {
				control: 'date'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		username: 'Ghoul',
		pfp: 'https://cdn.discordapp.com/avatars/536225818054230017/5bb30e5c8579484b1d1e28fc22863b75.webp?size=1024',
		text: 'Hello, world!',
		createdAt: new Date()
	}}
/>
