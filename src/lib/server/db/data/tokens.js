import { DataObject, DataStore } from './__models';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

const KEYS = {
	id: { },
	userId: { },
	valid: { patch: true },
	expires: { },
	user: { },
}

export class Token extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

export default class TokenStore extends DataStore {
	constructor(db) {
		super(db);
	}

	async create(data = {}) {
		try {
			var data = await this.db.insert(schema.tokens).values(data).returning();
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(data[0].id);
	}

	async get(id, extra = { user: true }) {
		try {
			var data = await this.db.query.tokens.findFirst({
				with: extra,
				where: eq(schema.tokens.id, id)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data) return new Token(this, KEYS, data);
		else return new Token(this, KEYS, { });
	}

	async getByUser(user, extra = { hook: true }) {
		try {
			var data = await this.db.query.tokens.findMany({
				with: extra,
				where: eq(schema.tokens.userId, user)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data?.[0]) return data.map(x => new Token(this, KEYS, x));
		else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.update(schema.tokens).set(data).where(eq(schema.tokens.id, id))
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(id);
	}

	async delete(id) {
		try {
			await this.db.delete(schema.tokens).where(eq(schema.tokens.id, id));
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}
		
		return;
	}
}