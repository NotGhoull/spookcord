import { env } from '$env/dynamic/public';
import { message } from '@spookcord/db-schema';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { get, writable } from 'svelte/store';

/**
 * A class to make connecting to the chat a little cleaner
 */
export class SupabaseService {
	private static instance: SupabaseService;

	// We have to declare client with this type, otherwise typescript shouts at us
	private client: ReturnType<typeof createClient> | null = null;
	private realtimeChannel: RealtimeChannel | null = null;
	private loadingTimeout: ReturnType<typeof setTimeout> | undefined;

	// Svelte writable sstores
	public isConnected = writable(false);
	public statusText = writable('Initalizing Supabase...');

	/**
	 * Gets the instance
	 * @returns The current instance
	 */
	public static getInstance(): SupabaseService {
		if (!SupabaseService.instance) {
			SupabaseService.instance = new SupabaseService();
		}
		return SupabaseService.instance;
	}

	/**
	 * Inits a new Client, or returns the old one
	 * @param jwt The Json Web Token of the user
	 * @returns A client object
	 */
	public init(jwt: string): ReturnType<typeof createClient> {
		if (this.client) {
			return this.client;
		}

		if (!env.PUBLIC_SUPABASE_URL) {
			throw new Error('[SupabaseService (error)] Missing env var `PUBLIC_SUPABASE_URL`');
		}

		this.client = createClient(env.PUBLIC_SUPABASE_URL, jwt);
		this.statusText.set('Created client');
		return this.client;
	}

	/**
	 * Connects to the realtime chat table of the channel
	 * @param channelId The channel to connect to
	 * @param onMessageUpdate A callback function
	 * @returns Nothing
	 */
	public connectToMessagesChannel(
		channelId: string,
		onMessageUpdate: (payload: {
			eventType: 'INSERT' | 'UPDATE' | 'DELETE';
			new: typeof message.$inferSelect;
			old: Partial<typeof message.$inferSelect>;
		}) => void
	): void {
		if (!this.client) {
			console.error('[SupabaseService (error)] Missing supabase client.\nFix: Call init() first');
			return;
		}

		// Clean up any existing channels
		this.disconnect();

		this.statusText.set('Connecting to realtime...');
		this.loadingTimeout = setTimeout(() => {
			if (!get(this.isConnected)) {
				this.statusText.set(
					'Connection is taking longer than expected, are you actually connected to the internet?'
				);
			}
		}, 30000);

		this.realtimeChannel = this.client
			.channel(`channel:${channelId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'message',
					filter: `channel_id=eq.${channelId}`
				},
				(payload) => {
					const newPayloadData = snakeToCamel(payload.new);
					const oldPayloadData = snakeToCamel(payload.old);

					console.debug(
						'[SupabaseService (Debug)] Got realtime update ',
						payload,
						newPayloadData,
						oldPayloadData
					);
					onMessageUpdate({
						eventType: payload.eventType,
						new: newPayloadData as typeof message.$inferSelect,
						old: oldPayloadData as Partial<typeof message.$inferSelect>
					});
				}
			)
			.subscribe((status, err) => {
				// Clear timeout
				if (this.loadingTimeout) clearTimeout(this.loadingTimeout);

				switch (status) {
					case 'SUBSCRIBED':
						console.info(
							`[SupabaseService (info)] Successfully subscribed to channel:${channelId}`
						);
						this.isConnected.set(true);
						this.statusText.set(''); // Clear text
						break;
					case 'CHANNEL_ERROR':
						console.error(
							`[SupabaseService (error)] Realtime channel error for ${channelId}: `,
							err
						);
						this.isConnected.set(false);
						this.statusText.set(`Connection error: ${err?.message}`);
						break;
					case 'TIMED_OUT':
						console.warn(
							`[SupabaseService (warn)] Realtime subsription timed out for ${channelId}: `,
							err
						);
						this.isConnected.set(false);
						this.statusText.set(`Connection timed out, check your connection.\n${err?.message}`);
						break;
					default:
						console.warn(`[SupabaseService (warn)] Unexpected state: ${status} - `, err);
						break;
				}
			});
	}

	/**
	 * Cleans up all connections
	 */
	public disconnect() {
		// Clear timeout
		if (this.loadingTimeout) clearTimeout(this.loadingTimeout);

		if (this.realtimeChannel) {
			console.info(
				`[SupabaseService (info)] Unsubscribing from channel ${this.realtimeChannel.topic}`
			);
			this.realtimeChannel.unsubscribe();
			this.realtimeChannel = null;
		}

		this.isConnected.set(false);

		console.debug(`[SupabaseService (debug)] Disconnected cleanly`);
	}
}

export const supabaseService = SupabaseService.getInstance();

export function snakeToCamel(obj: any): any {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((element) => snakeToCamel(element));
	}

	const newObj: { [key: string]: any } = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
			newObj[camelKey] = snakeToCamel(obj[key]);
		}
	}
	return newObj;
}
