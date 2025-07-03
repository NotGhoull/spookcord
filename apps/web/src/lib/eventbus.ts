import { writable } from 'svelte/store';

export const eventBus = writable({});

const listeners: { [K in keyof options]?: Array<(data: options[K]) => void> } = {};

interface options {
	updateManorList: null;
}

export function emit<K extends keyof options>(eventName: K, data: options[K]) {
	if (listeners[eventName]) {
		listeners[eventName].forEach((callback) => {
			callback(data);
		});
	}
}

export function subscribe<K extends keyof options>(
	eventName: K,
	callback: (data: options[K]) => void
) {
	if (!listeners[eventName]) {
		listeners[eventName] = [];
	}
	listeners[eventName].push(callback);

	return () => {
		if (listeners[eventName]) {
			listeners[eventName] = listeners[eventName].filter((cb) => cb !== callback);
			if (listeners[eventName].length === 0) {
				delete listeners[eventName];
			}
		}
	};
}
