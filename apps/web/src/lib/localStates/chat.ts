import { writable } from 'svelte/store';

// Set to HOME if not in a server
export const CurrentServer = writable('HOME');

// If prefixed with DM_ we know its a dm channel and not a server channel
export const CurrentChannel = writable('NO_CHANNEL');
