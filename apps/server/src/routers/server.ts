import { db } from '@/db';
import { protectedProcedure } from '@/lib/orpc';
import { category, server } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import z from 'zod/v4';

export const serverRouter = {
	get: protectedProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
		const found = await db.query.server.findFirst({
			where: eq(server.id, input.id),
			with: {
				members: {
					with: {
						user: {
							columns: {
								name: true
							}
						}
					}
				},
				categories: {
					with: {
						channels: true
					},
					orderBy: category.position
				}
			}
		});
		return found;
	})
};
