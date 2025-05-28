<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { LibraryIcon } from '@lucide/svelte';
	import Button from './Button.svelte';

	// The default button component for spookcord
	const { Story } = defineMeta({
		title: 'SpookcordUI/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				description: 'The variant of the button'
			},
			size: {
				control: 'select',
				description: 'The size of the button'
			},
			icon: {
				description: 'An icon from Lucide icons'
			},
			iconPosition: {
				description: 'What side of the button should the icon show on?'
			},
			fullWidth: {
				control: 'boolean',
				description: 'Decides if the button takes up the full width or not (shorthand for w-full)'
			},
			ref: {
				description: 'A refrence to the component (Bindable)'
			},
			href: {
				description:
					'If this has a value, the button becomes a link, when clicked it will navigate to the href'
			}
		}
	});
</script>

<!-- The default button component for spookcord -->
<Story name="default" args={{ icon: LibraryIcon }}>Hello, world!</Story>
<!-- <Story name="Primary" args={{ primary: true, label: 'Button' }} />

<Story name="Secondary" args={{ label: 'Button' }} />

<Story name="Large" args={{ size: 'large', label: 'Button' }} />

<Story name="Small" args={{ size: 'small', label: 'Button' }} /> -->
