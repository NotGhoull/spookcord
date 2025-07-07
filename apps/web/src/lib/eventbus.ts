const listeners: { [K in keyof options]?: Array<(data: options[K]) => void> } = {};

interface options {
	updateManorList: null;
	updateChannelList: null;
	// ^ This should be removed in favor of a realtime channel
	//   OR we fire a message, through a channel
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
