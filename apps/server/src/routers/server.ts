// This should probably be renamed to "manors"
// since thats their actual name, but its fine

import { db } from '@/db';
import type { Context } from '@/lib/context';
import { requireAuth } from '@/lib/orpc';
import { os } from '@orpc/server';
import { category, channel, server, serverMembers } from '@spookcord/db-schema';
import { and, eq } from 'drizzle-orm';
import z from 'zod/v4';

export const serverRouter = {
	create: os
		.$context<Context>()
		.input(z.object({ serverName: z.string() }))
		.use(requireAuth)
		.handler(async ({ input, context }) => {
			const result = await db.transaction(async (tx) => {
				const inviteCode = createInviteCode();

				// Create the server
				console.log('bingus my beloved');
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

				const defaultChannel = await tx
					.insert(channel)
					.values({
						name: 'General',
						categoryId: defaultCategory[0].id,
						type: 'text'
					})
					.returning();

				console.log('[Debug] Channel made');

				console.log('Created server! ', createdServer);
				return createdServer;
			});
		}),

	join: os
		.$context<Context>()
		.use(requireAuth)
		.input(z.object({ server: z.string() }))
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ input, context }) => {
			const foundServer = await db.query.server.findFirst({
				where: eq(server.inviteCode, input.server)
			});

			if (!foundServer) {
				return { success: false, message: 'No such invite found' };
			}

			const existingMembership = await db.query.serverMembers.findFirst({
				where: and(
					eq(serverMembers.serverId, foundServer.id),
					eq(serverMembers.userId, context.session.user.id)
				)
			});

			if (existingMembership) {
				return { success: false, message: 'You are already in this server' };
			}

			await db.insert(serverMembers).values({
				serverId: foundServer.id,
				userId: context.session.user.id
			});

			return { success: true, message: '' };
		}),

	get: os
		.$context<Context>()
		.input(z.object({ id: z.string() }))
		.use(requireAuth)
		.handler(async ({ input, context }) => {
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

// This could probably go somewhere else, but idk where
/**
 * Generates an 8 character long code
 * @returns The code
 */
function createInviteCode(): string {
	let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';

	const characterLength = characters.length;
	for (let i = 0; i < 8; i++) {
		result += characters.charAt(Math.floor(Math.random() * characterLength));
	}

	return result;
}
