import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	pgPolicy,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const jwks = pgTable('jwks', {
	id: text('id').primaryKey(),
	publicKey: text('public_key').notNull(),
	privateKey: text('private_key').notNull(),
	createdAt: timestamp('created_at').notNull()
});

export const server = pgTable('server', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),

	imageUrl: text('image_url').default(''),
	inviteCode: text('invite_code').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const serverMembers = pgTable(
	'server_members',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		serverId: uuid('server_id')
			.notNull()
			.references(() => server.id, { onDelete: 'cascade' }),

		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),

		joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => {
		return {
			unq: uniqueIndex('server_members_unique_idx').on(table.serverId, table.userId)
		};
	}
);

export const channel = pgTable('channel', {
	id: uuid('id').primaryKey().defaultRandom().notNull(),
	name: text('name').notNull(),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => category.id, { onDelete: 'cascade' }),

	type: text('type').notNull().default('text'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const category = pgTable('category', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	serverId: uuid('server_id')
		.notNull()
		.references(() => server.id, { onDelete: 'cascade' }),

	position: serial('position').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const message = pgTable('message', {
	id: uuid().primaryKey().defaultRandom(),
	body: text('body').notNull(),
	senderId: text('sender_id')
		.notNull()
		.references(() => user.id, { onDelete: 'restrict' }),

	// Foreign key to the channel where the message was sent
	channelId: uuid('channel_id')
		.notNull()
		.references(() => channel.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() // For editing messages

	// parentMessageId: uuid("parent_message_id").references(() => message.id, { onDelete: "set null"}),
}).enableRLS();

// RLS policies

pgPolicy('Server members or owners can view messages', {
	for: 'select',
	as: 'permissive',
	to: authenticatedRole,
	using: sql`
    ((EXISTS ( SELECT 1
     FROM ((server_members sm
       JOIN category cat ON ((cat.server_id = sm.server_id)))
       JOIN channel ch ON ((ch.category_id = cat.id)))
    WHERE ((ch.id = message.channel_id) AND (sm.user_id = (auth.jwt() ->> 'sub'::text))))) OR (EXISTS ( SELECT 1
     FROM ((server s
       JOIN category cat ON ((cat.server_id = s.id)))
       JOIN channel ch ON ((ch.category_id = cat.id)))
    WHERE ((ch.id = message.channel_id) AND (s.owner_id = (auth.jwt() ->> 'sub'::text))))))
    `
}).link(message);

pgPolicy('Users can delete their own messages or by server owner', {
	for: 'delete',
	as: 'permissive',
	to: authenticatedRole,
	using: sql`
    ((sender_id = (auth.jwt() ->> 'sub'::text)) OR (EXISTS ( SELECT 1
       FROM ((server s
         JOIN category cat ON ((cat.server_id = s.id)))
         JOIN channel ch ON ((ch.category_id = cat.id)))
      WHERE ((ch.id = message.channel_id) AND (s.owner_id = (auth.jwt() ->> 'sub'::text))))))

    `
}).link(message);

pgPolicy('Users can send messages to channels they are members of', {
	for: 'insert',
	as: 'permissive',
	to: authenticatedRole,
	withCheck: sql`
    ((sender_id = (auth.jwt() ->> 'sub'::text)) AND (EXISTS ( SELECT 1
     FROM ((server_members sm
       JOIN category cat ON ((cat.server_id = sm.server_id)))
       JOIN channel ch ON ((ch.category_id = cat.id)))
    WHERE ((ch.id = message.channel_id) AND (sm.user_id = (auth.jwt() ->> 'sub'::text))))))
    `
}).link(message);

pgPolicy('Users can update their own messages', {
	for: 'update',
	as: 'permissive',
	to: authenticatedRole,
	using: sql`(sender_id = (auth.jwt() ->> 'sub'::text))`,
	withCheck: sql`(sender_id = (auth.jwt() ->> 'sub'::text))`
}).link(message);

// --- Drizzle Relations (for easier querying with ORM) ---

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	ownedServers: many(server), // Servers owned by this user
	serverMemberships: many(serverMembers), // User's memberships in servers
	messages: many(message) // Messages sent by this user
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const serverRelations = relations(server, ({ many, one }) => ({
	owner: one(user, {
		fields: [server.ownerId],
		references: [user.id]
	}),
	categories: many(category),
	members: many(serverMembers) // Users belonging to this server
}));

export const categoryRelations = relations(category, ({ many, one }) => ({
	server: one(server, {
		fields: [category.serverId],
		references: [server.id]
	}),
	channels: many(channel) // Category has many channels
}));

export const serverMembersRelations = relations(serverMembers, ({ one }) => ({
	server: one(server, {
		fields: [serverMembers.serverId],
		references: [server.id]
	}),
	user: one(user, {
		fields: [serverMembers.userId],
		references: [user.id]
	})
}));

export const channelRelations = relations(channel, ({ many, one }) => ({
	server: one(category, {
		fields: [channel.categoryId],
		references: [category.id]
	}),
	messages: many(message) // Messages within this channel
}));

export const messageRelations = relations(message, ({ one }) => ({
	sender: one(user, {
		fields: [message.senderId],
		references: [user.id]
	}),
	channel: one(channel, {
		fields: [message.channelId],
		references: [channel.id]
	})
}));
