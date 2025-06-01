<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SettingsSectionButton from '$lib/components/SettingsSectionButton.svelte';
	import { TrashIcon } from '@lucide/svelte';
	import { expect, fn } from 'storybook/internal/test';

	const { Story } = defineMeta({
		title: 'Settings/Section Button',
		tags: ['autodocs'],
		component: SettingsSectionButton,

		argTypes: {
			onclick: {
				type: 'function'
			}
		},

		args: {
			onclick: fn()
		}
	});
</script>

<Story name="Default" args={{ label: 'Hello, world!', icon: TrashIcon }} />

<Story name="Selected" args={{ label: 'Selected', selected: true, icon: TrashIcon }} />

<Story
	name="Destructive"
	args={{ label: 'Destructive', variant: 'destructive', icon: TrashIcon }}
/>

<Story name="Default no icon" args={{ label: 'Hello, world!' }} />

<Story name="Selected no icon" args={{ label: 'Selected', selected: true }} />

<Story name="Destructive no icon" args={{ label: 'Destructive', variant: 'destructive' }} />

<Story
	tags={['hidden']}
	name="Button with a click handler"
	args={{ label: 'Click me!', selected: true }}
	play={async ({ canvas, userEvent, args }) => {
		const button = canvas.getByText('Click me!');
		expect(button).toBeInTheDocument();

		await userEvent.click(button);
		await expect(args.onclick).toHaveBeenCalled();
	}}
/>
