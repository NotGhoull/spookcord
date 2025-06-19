import { db } from '@/db';
import type { Context } from '@/lib/context';
import { protectedProcedure, requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { channel, message } from '@spookcord/db-schema';
import type { SpookcordError } from '@spookcord/types';
import {
	ROUTER_GET_MESSAGES_INPUT,
	ROUTER_GET_MESSAGES_OUTPUT,
	ROUTER_UPDATE_MESSAGE_OUTPUT
} from '@spookcord/types/api/channel';
import { eq } from 'drizzle-orm';
import z from 'zod';

// TODO: Figure out if its better to just use getMessages instead of the chaching shenanagins

export const channelRouter = {
	get: os
		.$context<Context>()
		.use(requireAuth)
		.input(ROUTER_GET_MESSAGES_INPUT)
		.output(ROUTER_GET_MESSAGES_OUTPUT)
		.handler(async ({ input }) => {
			console.log('[Debug] Getting channel');
			const dbResult = await db.query.channel
				.findFirst({
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
				})
				.catch((_) => {
					// Drop the error here, since its handled literally just below here
				});

			if (!dbResult) {
				return {
					success: false,
					error: {
						code: 'Database:Messaging/NOT_FOUND',
						message: 'Nothing could be found for that manor.'
					}
				};
			}

			return {
				success: true,
				response: {
					...dbResult
				}
			};
		}),

	// TODO: Add proper output typing to these
	updateMessage: os
		.input(z.object({ newText: z.string(), messageId: z.string() }))
		// .output(ROUTER_UPDATE_MESSAGE_OUTPUT)
		.handler(async ({ input }) => {
			db.update(message)
				.set({ body: input.newText })
				.where(eq(message.id, input.messageId))
				.catch((e) => {
					console.error(
						'DATABASE ERROR!\n\t- An error occurred while a user was trying to update a message: ',
						e
					);
					const err: SpookcordError = {
						code: 'Backend/Messaging:UNKNOWN',
						message: 'Failed to update message due to an internal error',
						timestamp: new Date().getTime()
					};

					return {
						success: false,
						error: err
					};
				});
			return {
				success: true,
				response: {
					message: 'Successfully updated message'
				}
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
				let err: SpookcordError = {
					code: 'Backend/Messaging:UNKNOWN',
					message: 'An unkown error occurred while trying to add message to database.',
					timestamp: new Date().getTime()
				};
				return {
					success: false,
					error: err
				};
			}

			return { success: true };
		})
};
