import { DataObject, DataStore } from './__models';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

const KEYS = {
	id: { },
	userId: { },
	name: { patch: true },
	url: { patch: true },
	embeds: { },
}

export class Hook extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

export default class HookStore extends DataStore {
	constructor(db) {
		super(db);
	}

	async create(data = {}) {
		try {
			var data = await this.db.insert(schema.hooks).values(data).returning();
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(data[0].id);
	}

	async get(id, extra = { embeds: true }) {
		try {
			var data = await this.db.query.hooks.findFirst({
				with: extra,
				where: eq(schema.hooks.id, id)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data) return new Hook(this, KEYS, data);
		else return new Hook(this, KEYS, { });
	}

	async getByUser(user, extra = { hook: true }) {
		try {
			var data = await this.db.query.hooks.findMany({
				with: extra,
				where: eq(schema.hooks.userId, user)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Hook(this, KEYS, x));
		else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.update(schema.hooks).set(data).where(eq(schema.hooks.id, id))
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(id);
	}

	async delete(id) {
		try {
			await this.db.delete(schema.hooks).where(eq(schema.hooks.id, id));
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}
		
		return;
	}
}