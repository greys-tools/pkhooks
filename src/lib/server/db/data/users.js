import { DataObject, DataStore } from './__models';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

const KEYS = {
	id: { },
	discordId: { },
	systemId: { patch: true },
	name: { patch: true },
	avatar: { patch: true },
	key: { patch: true },
	embeds: { },
	hooks: { },
}

export class User extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

export default class UserStore extends DataStore {
	constructor(db) {
		super(db);
	}

	async create(data = {}) {
		try {
			var data = await this.db.insert(schema.users).values(data).returning();
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(data[0].id);
	}

	async get(id, extra = { hooks: { with: { embeds: true } } }) {
		try {
			var data = await this.db.query.users.findFirst({
				with: extra,
				where: eq(schema.users.id, id)
			});
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		if(data) return new User(this, KEYS, data);
		else return new User(this, KEYS, { });
	}

	async update(id, data = {}) {
		try {
			await this.db.update(schema.users).set(data).where(eq(schema.users.id, id))
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}

		return await this.get(id);
	}

	async delete(id) {
		try {
			await this.db.delete(schema.users).where(eq(schema.users.id, id));
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message ?? e);
		}
		
		return;
	}
}