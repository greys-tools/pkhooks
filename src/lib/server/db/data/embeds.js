import { DataObject, DataStore } from './__models';
import * as schema from '../schema';
import { eq, and } from 'drizzle-orm';

const KEYS = {
	id: { },
	userId: { },
	hookId: { },
	event: { },
	format: { patch: true },
	data: { patch: true },
	hook: { },
}

export class Embed extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

export default class EmbedStore extends DataStore {
	constructor(db) {
		super(db);
	}

	async create(data = {}) {
		try {
			var data = await this.db.insert(schema.embeds).values(data).returning();
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(data[0].id);
	}

	async get(id, extra = { hook: true }) {
		try {
			var data = await this.db.query.embeds.findFirst({
				with: extra,
				where: eq(schema.embeds.id, id)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data) return new Embed(this, KEYS, data);
		else return new Embed(this, KEYS, { });
	}

	async getByUser(user, extra = { hook: true }) {
		try {
			var data = await this.db.query.embeds.findMany({
				with: extra,
				where: eq(schema.embeds.userId, user)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Embed(this, KEYS, x));
		else return [];
	}

	async getByHook(hook, extra = { hook: true }) {
		try {
			var data = await this.db.query.embeds.findMany({
				with: extra,
				where: eq(schema.embeds.hookId, hook)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Embed(this, KEYS, x));
		else return [];
	}

	async getByEvent(user, event, extra = { hook: true }) {
		try {
			var data = await this.db.query.embeds.findMany({
				with: extra,
				where: and(eq(schema.embeds.userId, user), eq(schema.embeds.event, event))
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		console.log(data);
		if(data?.[0]) return data.map(x => new Embed(this, KEYS, x));
		else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.update(schema.embeds).set(data).where(eq(schema.embeds.id, id))
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(id);
	}

	async delete(id) {
		try {
			await this.db.delete(schema.embeds).where(eq(schema.embeds.id, id));
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}
		
		return;
	}
}