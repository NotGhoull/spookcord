import { z } from 'zod/v4';
import { BaseSpookcordResponseSchema } from '..';

export const USER_GET_INPUT = z.object({
	userId: z.string()
});

export const USER_GET_OUTPUT = BaseSpookcordResponseSchema.extend({
	response: z
		.object({
			// Note: We omit the email here, since we don't want to leak it
			id: z.string(),
			name: z.string(),
			image: z.string().nullable().optional(),
			createdAt: z.date(),
			updatedAt: z.date()
		})
		.optional()
});
