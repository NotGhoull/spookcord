import z from 'zod/v4';
import { BaseSpookcordResponseSchema } from '../index';

// Theres probably a better way to do this, but this is good
// since it gives us more control over how our data is returned
// and it would be better for versioned apis (maybe)
export const ROUTER_GET_MESSAGES_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			// Here, we should add a "permissions" field, which would tell the user what they can and can't do
			// For example: CAN_CREATE_CHANNEL, CAN_DELETE_CHANNEL, etc
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
	response: z
		.object({
			message: z.string()
		})
		.optional()
});

export const ROUTER_UPDATE_MESSAGE_INPUT = z.object({
	newText: z.string(),
	messageId: z.string()
});

export const ROUTER_SEND_MESSAGE_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			// Just return the message object
			id: z.string(),
			body: z.string(),
			senderId: z.string(),
			channelId: z.string(),
			createdAt: z.date(),
			updatedAt: z.date()
		})
		.optional()
});

export const ROUTER_SEND_MESSAGE_INPUT = z.object({
	body: z.string(),
	channelId: z.string()
});

export const ROUTER_CREATE_CHANNEL_INPUT = z.object({
	categoryId: z.string(),
	type: z.enum(['text', 'voice']),
	name: z.string().min(1, 'Channel name cannot be empty')
});

export const ROUTER_CREATE_CHANNEL_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string().min(1, 'Channel name cannot be empty'),
			createdAt: z.date(),
			updatedAt: z.date(),
			categoryId: z.string(),
			type: z.enum(['text', 'voice'])
		})
		.optional()
});
