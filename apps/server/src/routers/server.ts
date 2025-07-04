// This should probably be renamed to "manors"
// since thats their actual name, but its fine

import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { category, channel, server, serverMembers } from '@spookcord/db-schema';
import { and, eq } from 'drizzle-orm';
import z from 'zod/v4';
import { randomInt } from 'crypto';
import {
	SERVER_CREATE_INPUT,
	SERVER_CREATE_OUTPUT,
	SERVER_GET_INPUT,
	SERVER_GET_OUTPUT,
	SERVER_JOIN_INPUT,
	SERVER_JOIN_OUTPUT
} from '@spookcord/types/api/server';

export const serverRouter = {
	create: os
		.$context<Context>()
		.input(SERVER_CREATE_INPUT)
		.output(SERVER_CREATE_OUTPUT)
		.use(requireAuth)
		.handler(async ({ input, context }) => {
			const result = await db
				.transaction(async (tx) => {
					const inviteCode = createInviteCode();

					// Create the server
					const newServer = await tx
						.insert(server)
						.values({
							name: input.serverName,
							ownerId: context.session.user.id,
							inviteCode: inviteCode
						})
						.returning();

					const createdServer = newServer[0];

					// Make the owner a member of the server
					await tx.insert(serverMembers).values({
						serverId: createdServer.id,
						userId: context.session.user.id
					});

					// Create default category
					const defaultCategory = await tx
						.insert(category)
						.values({
							name: 'Default',
							position: 0,
							serverId: createdServer.id
						})
						.returning();

					await tx.insert(channel).values({
						name: 'General',
						categoryId: defaultCategory[0].id,
						type: 'text'
					});

					return createdServer;
				})
				.catch((e) => {
					let errorID = crypto.randomUUID();
					console.error(
						`[api:server/error (${errorID})] An error occurred during manor creation: `,
						e
					);
					return {
						success: false,
						error: {
							code: 'Backend:Manor/INTERNAL_ERROR',
							message: "The manor couldn't be created due to an internal error",
							details: {
								logId: errorID
							}
						}
					};
				});

			let parsed = SERVER_CREATE_OUTPUT.safeParse({ success: true, response: { ...result } });
			if (!parsed.success) {
				let errorID = crypto.randomUUID();
				console.error(
					`[api:server/error (${errorID})] An error occurred while parsing a manor: `,
					parsed.error,
					result
				);
				return {
					success: false,
					error: {
						code: 'Backend:Manor/INVALID_DATA',
						message: 'The manor was created, but its data is malformed.',
						details: {
							logId: errorID
						}
					}
				};
			}
			return parsed.data;
		}),

	join: os
		.$context<Context>()
		.use(requireAuth)
		.input(SERVER_JOIN_INPUT)
		.output(SERVER_JOIN_OUTPUT)
		.handler(async ({ input, context }) => {
			const foundServer = await db.query.server.findFirst({
				where: eq(server.inviteCode, input.server)
			});

			if (!foundServer) {
				// We don't include logging for this, since it could get
				// out of hand with people just spam trying invites
				return {
					success: false,
					error: {
						code: 'Backend:Manor/NOT_FOUND',
						message: 'No such invite found.'
					}
				};
			}

			const existingMembership = await db.query.serverMembers.findFirst({
				where: and(
					eq(serverMembers.serverId, foundServer.id),
					eq(serverMembers.userId, context.session.user.id)
				)
			});

			if (existingMembership) {
				// Once again, no logging on this error
				// Maybe we could add a flag or something "LOG_VERBOSE_ERRORS"
				return {
					success: false,
					error: {
						code: 'Backend:Manor/CONFLICT',
						message: 'You are already in this server'
					}
				};
			}

			await db.insert(serverMembers).values({
				serverId: foundServer.id,
				userId: context.session.user.id
			});

			let parsed = SERVER_JOIN_OUTPUT.safeParse({ success: true, response: { ...foundServer } });
			if (!parsed.success) {
				return {
					success: false,
					error: {
						code: 'Backend:Manor/INVALID_DATA',
						message: "The returned manor's data was malformed"
					}
				};
			}

			return parsed.data;
		}),

	get: os
		.$context<Context>()
		.input(SERVER_GET_INPUT)
		.output(SERVER_GET_OUTPUT)
		.use(requireAuth)
		.handler(async ({ input, context }) => {
			// Continue to make this query even if we're not sure if they're apart of the manor
			// since we can use it to verify them after
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

			if (!found) {
				return {
					success: false,
					error: {
						code: 'Backend:Manor/NOT_FOUND',
						message: "Couldn't find a manor with that ID"
					}
				};
			}

			const isMember = found.members.some((member) => member.userId === context.session.user.id);

			if (!isMember) {
				let errorID = crypto.randomUUID();
				console.error(
					`[api:server/error (${errorID})] Unauthorized access attempt to server "${input.id}", by user ${context.session.user.id}. Blocked: Not a member`
				);

				return {
					success: false,
					error: {
						code: 'Backend:Manor/FORBIDDEN',
						message: "You cannot view manors that you don't belong to.",
						details: {
							logId: errorID
						}
					}
				};
			}

			let parsed = SERVER_GET_OUTPUT.safeParse({ success: true, response: found });
			if (!parsed.success) {
				let errorID = crypto.randomUUID();
				console.error(
					`[api:server/error (${errorID})] Malformed data returned from server "${input.id}"`,
					parsed.error
				);
				return {
					success: false,
					error: {
						code: 'Backend:Manor/INVALID_DATA',
						message: "The returned manor's data was malformed",
						details: {
							logId: errorID
						}
					}
				};
			}

			return parsed.data;
		})
};

// This could probably go somewhere else, but idk where
/**
 * Generates a random 8-character invite code using uppercase and lowercase English letters.
 *
 * @returns An 8-character string suitable for use as an invite code.
 */
function createInviteCode(): string {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';

	const characterLength = characters.length;
	for (let i = 0; i < 8; i++) {
		result += characters.charAt(randomInt(0, characterLength));
	}

	return result;
}
