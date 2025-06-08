import { db } from '@/db';
import { protectedProcedure } from '@/lib/orpc';
import { user } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';

export const meRouter = {
	// Get the currently logged in user
	get: protectedProcedure.handler(async ({ context }) => {
		const found = await db.query.user.findFirst({
			where: eq(user.id, context.session.user.id),
			with: {
				serverMemberships: true
			}
		});
		return found;
	})
};
