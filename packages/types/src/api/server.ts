import { z } from 'zod/v4';
import { BaseSpookcordResponseSchema, SpookcordErrorSchema } from '..';
import { server } from '@spookcord/db-schema';

export const SERVER_CREATE_INPUT = z.object({
	serverName: z.string().min(2).max(100)
});

export const SERVER_CREATE_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			createdAt: z.date(),
			updatedAt: z.date(),
			ownerId: z.string(),
			imageUrl: z.string().nullable().optional(),
			inviteCode: z.string()
		})
		.optional()
});

export const SERVER_JOIN_INPUT = z.object({
	server: z.string()
});

export const SERVER_JOIN_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			createdAt: z.date(),
			updatedAt: z.date(),
			ownerId: z.string(),
			imageUrl: z.string().nullable().optional(),
			inviteCode: z.string()
		})
		.optional()
});
