import {
	pgTable,
	uuid,
	text,
	jsonb,
	boolean,
	timestamp,
} from 'drizzle-orm/pg-core';

// one year
const EXPIRY = 365 * 24 * 60 * 60 * 1000;

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	discordId: text('discord_id').notNull(),
	name: text().notNull(),
	avatar: text().notNull(),
})

// for user logins
export const tokens = pgTable('tokens', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => users.id).notNull(),
	valid: boolean().default(true),
	expires: timestamp().$default(() => new Date(Date.now() + EXPIRY))
})

export const hooks = pgTable('hooks', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').references(() => users.id).notNull(),
	name: text('name').notNull(),
	url: text('url').notNull(),
	key: text('key'),
	events: text('events').array(),
	data: jsonb('data'),
});

export const logs = pgTable('logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').references(() => users.id).notNull(),
	hookId: uuid('hook_id').references(() => hooks.id).notNull(),
	status: text(),
	message: text(),
})