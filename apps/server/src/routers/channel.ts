import { db } from '@/db';
import { protectedProcedure } from '@/lib/orpc';
import { channel, message } from '@spookcord/db-schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

// TODO: Figure out if its better to just use getMessages instead of the chaching shenanagins

export const channelRouter = {
	get: protectedProcedure.input(z.object({ channelId: z.string() })).handler(async ({ input }) => {
		return db.query.channel.findFirst({
			where: eq(channel.id, input.channelId),
			with: {
				messages: {
					orderBy: message.createdAt,
					with: {
						sender: {
							columns: {
								name: true
							}
						}
					}
				}
			}
		});
	}),

	getMessages: protectedProcedure
		.input(z.object({ channelId: z.string() }))
		.handler(async ({ input }) => {
			// TODO: Check if the current user is actually apart of the server
			// TODO: Sort messages
			return db.query.message.findMany({
				where: eq(message.channelId, input.channelId)
			});
		})
};
