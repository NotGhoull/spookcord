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

export const SERVER_GET_INPUT = z.object({
	id: z.string()
});

export const SERVER_GET_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			createdAt: z.date(),
			updatedAt: z.date(),
			ownerId: z.string(),
			imageUrl: z.string().nullable().optional(),
			inviteCode: z.string(),
			categories: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					createdAt: z.date(),
					updatedAt: z.date(),
					serverId: z.string(),
					position: z.number(),
					channels: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							createdAt: z.date(),
							updatedAt: z.date(),
							categoryId: z.string(),
							type: z.enum(['text', 'voice'])
						})
					)
				})
			),
			members: z.array(
				z.object({
					id: z.string(),
					userId: z.string(),
					serverId: z.string(),
					joinedAt: z.date(),
					user: z.object({
						name: z.string()
					})
				})
			)
		})
		.optional()
});
