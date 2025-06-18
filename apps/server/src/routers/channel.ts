import { db } from '@/db';
import type { Context } from '@/lib/context';
import { protectedProcedure, requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
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
		}),

	updateMessage: os
		.input(z.object({ newText: z.string(), messageId: z.string() }))
		.handler(async ({ input }) => {
			db.update(message)
				.set({ body: input.newText })
				.where(eq(message.id, input.messageId))
				.catch((e) => {
					console.error(
						'DATABASE ERROR!\n\t- An error occurred while a user was trying to update a message: ',
						e
					);
					return {
						success: false,
						// I'll turn this into a type, eventually
						error: {
							code: 'Server/Messaging:DATABASE_ERROR',
							message: 'Failed to update message due to an internal error.',
							timestamp: new Date().getTime()
						}
					};
				});
			return {
				success: true
			};
		}),

	sendMessage: os
		.$context<Context>()
		.use(requireAuth)
		.input(z.object({ body: z.string(), channelId: z.string() }))
		.handler(async ({ input, context }) => {
			const [inserted] = await db
				.insert(message)
				.values({
					channelId: input.channelId,
					senderId: context.session.user.id,
					body: input.body
				})
				.returning();

			if (!inserted) {
				// TODO: I'll make a proper error type probably in the next PR (feat/error-types)
				//       And we'll use that for standardization of errors in general
				return {
					success: false,
					message: 'Database error'
				};
			}

			return { success: true };
		})
};
