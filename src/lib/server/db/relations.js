import { relations } from "drizzle-orm/relations";
import { users, embeds, hooks, logs, tokens } from "./schema";

export const embedsRelations = relations(embeds, ({one}) => ({
	user: one(users, {
		fields: [embeds.userId],
		references: [users.id]
	}),
	hook: one(hooks, {
		fields: [embeds.hookId],
		references: [hooks.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	embeds: many(embeds),
	hooks: many(hooks),
	logs: many(logs),
	tokens: many(tokens),
}));

export const hooksRelations = relations(hooks, ({one, many}) => ({
	embeds: many(embeds),
	user: one(users, {
		fields: [hooks.userId],
		references: [users.id]
	}),
	logs: many(logs),
}));

export const logsRelations = relations(logs, ({one}) => ({
	user: one(users, {
		fields: [logs.userId],
		references: [users.id]
	}),
	hook: one(hooks, {
		fields: [logs.hookId],
		references: [hooks.id]
	}),
}));

export const tokensRelations = relations(tokens, ({one}) => ({
	user: one(users, {
		fields: [tokens.userId],
		references: [users.id]
	}),
}));