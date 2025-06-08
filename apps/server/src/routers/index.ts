import { db } from '@/db';
import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../lib/orpc';
import { and, eq } from 'drizzle-orm';
import { generateSupabaseJWT } from '@/lib/bauthjwt';
import { serial } from 'drizzle-orm/pg-core';
import {
	category,
	channel,
	message,
	messageRelations,
	server,
	serverMembers,
	user
} from '@spookcord/db-schema';
import { type } from '@orpc/server';
import { type InferSelectModel } from 'drizzle-orm';
import { serverRouter } from './server';
import { meRouter } from './me';
import { channelRouter } from './channel';
import { userRouter } from './user';

// THIS IS VERY UNFINISHED
// A lot of functions here are missing authentication checks
// Also, we should split up a lot of these to be in their own files

export const appRouter = {
	server: serverRouter,
	me: meRouter,
	channel: channelRouter,
	user: {
		get: userRouter.get
	},

	health: {
		check: publicProcedure.handler(() => {
			return 'OK';
		})
	},

	getMessages: protectedProcedure
		.input(z.object({ channelId: z.string() }))
		.handler(async ({ input, context }) => {
			return await db.query.message.findMany({
				where: eq(message.channelId, input.channelId)
			});
		}),
	sendMessage: protectedProcedure
		.input(z.object({ body: z.string(), channelId: z.string() }))
		.handler(({ input, context }) => {
			db.insert(message)
				.values({
					channelId: input.channelId,
					senderId: context.session.user.id,
					body: input.body
				})
				.returning()
				.then((resp) => {
					console.log('Updated databsae');
					console.log(resp);
				});
		}),

	getUserById: protectedProcedure
		.input(z.object({ id: z.optional(z.string()) }))
		.handler(async ({ input, context }) => {
			const found = await db.query.user.findFirst({
				where: eq(user.id, input.id ?? context.session.user.id),
				with: {
					serverMemberships: true
				}
			});
			return found;
		}),

	getChannelById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const found = await db.query.channel.findFirst({
				where: eq(channel.id, input.id)
			});
			return found;
		}),

	createNewServer: protectedProcedure
		// Skill diff
		.input(z.object({ serverName: z.string() }))
		.handler(async ({ input, context }) => {
			// Start atomic transaction

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

	getJWT: protectedProcedure.handler(({ context }) => {
		console.log('Creating with ', context.session.user.id);
		return generateSupabaseJWT(context.session.user.id);
	}),

	joinServer: protectedProcedure
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.input(z.object({ server: z.string() }))
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

	getServerById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const found = await db.query.server.findFirst({
				where: eq(server.id, input.id),
				with: {
					members: true
				}
			});
			return found;
		}),

	getUserServers: protectedProcedure.handler(async ({ context }) => {
		const found = await db.query.serverMembers.findMany({
			where: eq(serverMembers.userId, context.session.user.id)
		});
		return found;
	})
};

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

export type AppRouter = typeof appRouter;
