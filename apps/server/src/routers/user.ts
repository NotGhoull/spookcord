import { db } from '@/db';
import { os } from '@orpc/server';
import { user } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const userRouter = {
	get: os.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
		return db.query.user.findFirst({
			where: eq(user.id, input.userId)
		});
	})
};
