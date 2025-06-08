import { db } from '@/db';
import { protectedProcedure } from '@/lib/orpc';
import { user } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const userRouter = {
	get: protectedProcedure.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
		return db.query.user.findFirst({
			where: eq(user.id, input.userId)
		});
	})
};
