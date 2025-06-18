import { db } from '@/db';
import { protectedProcedure } from '@/lib/orpc';
import { ORPCError } from '@orpc/client';
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
		if (!found) {
			throw new ORPCError('Sorry, something went wrong');
		}
		return found;
	})
};
