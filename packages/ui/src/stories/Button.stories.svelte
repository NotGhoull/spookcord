<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { LibraryIcon, TrashIcon, PlusIcon } from '@lucide/svelte';
	import Button from './Button.svelte';
	import { expect } from 'storybook/internal/test';

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
			},
			onclick: {
				type: 'function'
			}
		}
	});
</script>

<!-- The default button component for spookcord -->
<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Hello, world!' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent('Hello, world!');

		// Assert icon presence and default position
		const icon = button.querySelector('svg');
		expect(icon).toBeInTheDocument();
		// Check if the icon is before the text content (left side)
		expect(button.children[0]).toBe(icon);
	}}
	name="Default Variant"
	args={{ icon: LibraryIcon }}>Hello, world!</Story
>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Hello, world!' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-primary', 'text-white', 'hover:bg-primary/90');
	}}
	name="Primary Variant"
	args={{ variant: 'primary', icon: LibraryIcon }}>Hello, world!</Story
>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Delete' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
	}}
	name="Destructive Variant"
	args={{ variant: 'destructive', icon: TrashIcon }}
>
	Delete
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Outline Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('border-input', 'bg-background', 'border');
	}}
	name="Outline Variant"
	args={{ variant: 'outline' }}
>
	Outline Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Secondary Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
	}}
	name="Secondary Variant"
	args={{ variant: 'secondary' }}
>
	Secondary Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Ghost Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('hover:bg-accent/20', 'hover:text-accent');
	}}
	name="Ghost Variant"
	args={{ variant: 'ghost' }}
>
	Ghost Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Link Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline');
	}}
	name="Link Variant"
	args={{ variant: 'link' }}
>
	Link Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Gradient Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-primary/90');
	}}
	name="Gradient Variant"
	args={{ variant: 'gradient' }}
>
	Gradient Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Small Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('h-9', 'px-3');
	}}
	name="Small Size"
	args={{ size: 'sm' }}
>
	Small Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Large Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('h-11', 'px-8', 'text-md');
	}}
	name="Large Size"
	args={{ size: 'lg' }}
>
	Large Button
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button'); // No text, so get by role directly
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('h-10', 'w-10'); // icon size
		const icon = button.querySelector('svg');
		expect(icon).toBeInTheDocument();
	}}
	name="Icon Only"
	args={{ size: 'icon', icon: PlusIcon }}
/>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Icon Right' });
		expect(button).toBeInTheDocument();
		const icon = button.querySelector('svg');
		expect(icon).toBeInTheDocument();

		expect(button.children[0]).toBe(icon);
	}}
	name="Icon Right"
	args={{ icon: PlusIcon, iconPosition: 'right' }}
>
	Icon Right
</Story>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Full Width Button' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('w-full');
	}}
	name="Full Width"
	args={{ fullWidth: true }}
>
	Full Width Button
</Story>

<Story
	play={async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Go to GitHub' });
		expect(button).toBeInTheDocument();

		// TODO: Figure out how to mock fns
		await userEvent.click(button);
	}}
	name="As link"
	args={{ href: 'https://github.com/notghoull/spookcord' }}>Go to GitHub</Story
>

<Story
	play={async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Disabled Button' });
		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();

		// Once again, need to figure out how to mock functions
	}}
	name="Disabled"
	args={{ disabled: true }}
>
	Disabled Button
</Story>
