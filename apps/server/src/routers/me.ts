import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { user } from '@spookcord/db-schema';
import { ME_GET_OUTPUT } from '@spookcord/types/api/me';
import { eq } from 'drizzle-orm';

export const meRouter = {
	get: os
		.$context<Context>()
		.use(requireAuth)
		.output(ME_GET_OUTPUT)
		.handler(async ({ context }) => {
			const found = await db.query.user.findFirst({
				where: eq(user.id, context.session.user.id),
				with: {
					serverMemberships: true
				}
			});
			if (!found) {
				let errorId = crypto.randomUUID();
				console.error(
					`[api:me/error (${errorId})] Unable to find data for user "${context.session.user.id}", data may be missing or broken.`
				);
				return {
					success: false,
					error: {
						code: 'Backend:User/NOT_FOUND',
						message: 'Unable to find your user, something went wrong. Try again, later',
						details: {
							logId: errorId
						}
					}
				};
			}
			let parsed = ME_GET_OUTPUT.safeParse({
				success: true,
				response: {
					...found
				}
			});
			if (!parsed.success) {
				// TODO, when we do logging, make this proper
				let errorId = crypto.randomUUID();
				console.error(
					`[api:me/error (${errorId})] Failed to parse ME_GET_OUTPUT, errors:`,
					parsed.error
				);
				return {
					success: false,
					error: {
						code: 'Backend:User/INVALID_DATA',
						message: 'Unable to parse user data, your data may be broken or corrupted.',
						details: {
							logId: errorId
						}
					}
				};
			}

			return parsed.data;
		})
};
