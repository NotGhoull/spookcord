import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { user } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const userRouter = {
	get: os
		.$context<Context>()
		.use(requireAuth)
		.input(z.object({ userId: z.string() }))
		.handler(async ({ input }) => {
			return db.query.user.findFirst({
				where: eq(user.id, input.userId)
			});
		})
};
