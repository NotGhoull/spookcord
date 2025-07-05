import z from 'zod/v4';
import { BaseSpookcordResponseSchema } from '..';
import { serverMembers, user } from '@spookcord/db-schema';

export const ME_GET_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
			emailVerified: z.boolean(),
			image: z.string().nullable(),
			createdAt: z.date(),
			updatedAt: z.date(),
			serverMemberships: z.array(
				z.object({
					id: z.string(),
					userId: z.string(),
					serverId: z.string(),
					joinedAt: z.date()
				})
			)
		})
		.optional()
});
