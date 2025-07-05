import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { user } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import { USER_GET_INPUT, USER_GET_OUTPUT } from '@spookcord/types/api/user';

export const userRouter = {
	get: os
		.$context<Context>()
		.use(requireAuth)
		.input(USER_GET_INPUT)
		.output(USER_GET_OUTPUT)
		.handler(async ({ input }) => {
			let found = await db.query.user.findFirst({
				where: eq(user.id, input.userId)
			});

			if (!found) {
				return {
					success: false,
					error: {
						code: 'Backend:User/NOT_FOUND',
						message: "Couldn't find specified user"
					}
				};
			}

			let parsed = USER_GET_OUTPUT.safeParse({ success: true, response: found });
			if (!parsed.success) {
				const errorId = crypto.randomUUID();
				console.error(
					`[api:user/error (${errorId})] User "${input.userId}" contains malformed data.`,
					parsed.error
				);
				return {
					success: false,
					error: {
						code: 'Backend:User/INVALID_DATA',
						message: 'The user found contains malformed data.',
						details: {
							logId: errorId
						}
					}
				};
			}
			return parsed.data;
		})
};
