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

	// TODO: Add auth checks
	updateMessage: os
		.input(ROUTER_UPDATE_MESSAGE_INPUT)
		.output(ROUTER_UPDATE_MESSAGE_OUTPUT)
		.handler(async ({ input }) => {
			let errorType: DrizzleError | undefined;
			await db
				.update(message)
				.set({ body: input.newText })
				.where(eq(message.id, input.messageId))
				.catch((e: DrizzleError) => {
					errorType = e;
					// We drop it to avoid weirdness with oRPC
				});

			if (typeof errorType !== 'undefined') {
				// TODO: Add proper logging
				let tracking = randomUUID();
				console.error(
					`\n============ ERROR LOG =============\n[api:Channel] (${tracking}) | An error happened! \n\t- Name: ${errorType.name}\n\t- Cause: ${errorType.cause}\n\t- Message: ${errorType.message}\n=========== END ERROR ========="`
				);

				return {
					success: false,
					error: {
						code: 'Database:Messaging/UNKNOWN',
						message: 'An unknown error occurred while trying to update the message.',
						details: {
							// This is here for debugging, until we actually figure out what the error types are
							errorId: tracking
						}
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
