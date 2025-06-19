import z from 'zod/v4';
import { BaseSpookcordResponseSchema } from '../index';

export const ROUTER_GET_CHANNEL_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z.object({
		something: z.string()
	})
});

// Theres probably a better way to do this, but this is good
// since it gives us more control over how our data is returned
// and it would be better for versioned apis (maybe)
export const ROUTER_GET_MESSAGES_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			messages: z.array(
				z.object({
					id: z.string(),
					senderId: z.string(),
					body: z.string(),
					createdAt: z.date(),
					updatedAt: z.date(),
					sender: z.object({
						name: z.string()
					})
				})
			)
		})
		.optional()
});

export const ROUTER_GET_MESSAGES_INPUT = z.object({
	channelId: z.string()
});

export const ROUTER_UPDATE_MESSAGE_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z.object({
		message: z.string()
	})
});
