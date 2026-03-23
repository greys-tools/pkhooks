import { env } from '$env/dynamic/private';

import { db } from '$lib/server/db';
import { users, tokens } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

import jwt from 'jsonwebtoken';

export async function handle({ event, resolve }) {
	let tk = event.cookies.get('token');
	if(tk?.length) {
		let decoded;

		try {
			decoded = jwt.verify(tk, env.JWT_SECRET);
		} catch(e) {
			console.error(e);
		}

		if(decoded && decoded.tk) {
			let token = await db.select().from(tokens).where(eq(tokens.id, decoded.tk));
			token = token?.[0] ?? token;

			if(token && token.valid && token.expires.getTime() > Date.now()) {
				let user = await db.select().from(users).where(eq(users.id, token.userId));
				user = user?.[0] ?? user;

				if(user) event.locals.user = user;
			}
		}
	}

	const response = await resolve(event);
	return response;
}