import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { channel, message } from '@spookcord/db-schema';
import {
	ROUTER_GET_MESSAGES_INPUT,
	ROUTER_GET_MESSAGES_OUTPUT,
	ROUTER_SEND_MESSAGE_INPUT,
	ROUTER_SEND_MESSAGE_OUTPUT,
	ROUTER_UPDATE_MESSAGE_INPUT,
	ROUTER_UPDATE_MESSAGE_OUTPUT
} from '@spookcord/types/api/channel';
import { randomUUID } from 'crypto';
import { DrizzleError, eq } from 'drizzle-orm';
import z from 'zod';

export const channelRouter = {
	get: os
		.$context<Context>()
		.use(requireAuth)
		.input(ROUTER_GET_MESSAGES_INPUT)
		.output(ROUTER_GET_MESSAGES_OUTPUT)
		.handler(async ({ input }) => {
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
				// If we don't catch here, we end up returning a generic 500 error
				.catch((e) => {
					console.warn(
						`[api:channel/warn] Failed to fetch message: ${e}\n  - Note: Error dropped, to be handled later`
					);
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

	updateMessage: os
		.$context<Context>()
		.use(requireAuth)
		.input(ROUTER_UPDATE_MESSAGE_INPUT)
		.output(ROUTER_UPDATE_MESSAGE_OUTPUT)
		.handler(async ({ input, context }) => {
			let messageToChange = await db.query.message.findFirst({
				where: eq(message.id, input.messageId)
			});

			if (!messageToChange) {
				return {
					success: false,
					error: {
						code: 'Backend:Messaging/NOT_FOUND',
						message: "The message you're trying to edit couldn't be found"
					}
				};
			}

			if (messageToChange.senderId !== context.session.user.id) {
				return {
					success: false,
					error: {
						code: 'Backend:Messaging/FORBIDDEN',
						message: "You cannot edit a message you don't own"
					}
				};
			}

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
		.input(ROUTER_SEND_MESSAGE_INPUT)
		.output(ROUTER_SEND_MESSAGE_OUTPUT)
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
				return {
					success: false,
					error: {
						code: 'Database:Messaging/UNKNOWN',
						message: 'An unknown error occurred while trying to send the message.'
					}
				};
			}

			return {
				success: true,
				response: {
					...inserted
				}
			};
		})
};
