import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';
import { env } from '$env/dynamic/private';
import Stores from './data';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema: { ...schema, ...relations } });
let stores = {};
for(var s in Stores) {
	stores[s] = new Stores[s](db);
}
export { stores };