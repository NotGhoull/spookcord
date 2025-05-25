import { writable } from 'svelte/store';

export let isMemberViewVisible = writable(true, () => {
	console.log('Member view updated! ', isMemberViewVisible);
	return () => console.log('Memberview destroyed');
});
