import { DataObject, DataStore } from './__models';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

const KEYS = {
	id: { },
	userId: { },
	hookId: { },
	status: { },
	data: { },
}

export class Log extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

export default class LogStore extends DataStore {
	constructor(db) {
		super(db);
	}

	async create(data = {}) {
		try {
			var data = await this.db.insert(schema.logs).values(data).returning();
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(data[0].id);
	}

	async get(id, extra = { user: true }) {
		try {
			var data = await this.db.query.logs.findFirst({
				with: extra,
				where: eq(schema.logs.id, id)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data) return new Log(this, KEYS, data);
		else return new Log(this, KEYS, { });
	}

	async getByUser(user, extra = { hook: true }) {
		try {
			var data = await this.db.query.logs.findMany({
				with: extra,
				where: eq(schema.logs.userId, user)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Log(this, KEYS, x));
		else return [];
	}

	async getByHook(hook, extra = { hook: true }) {
		try {
			var data = await this.db.query.logs.findMany({
				with: extra,
				where: eq(schema.logs.hookId, hook)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Log(this, KEYS, x));
		else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.update(schema.logs).set(data).where(eq(schema.logs.id, id))
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(id);
	}

	async delete(id) {
		try {
			await this.db.delete(schema.logs).where(eq(schema.logs.id, id));
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}
		
		return;
	}
}