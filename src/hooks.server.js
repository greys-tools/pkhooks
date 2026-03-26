import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import { stores } from '$lib/server/db';

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
			let token = await stores.tokens.get(decoded.tk);

			if(token && token.valid && token.expires.getTime() > Date.now()) {
				event.locals.user = token.user;
			}
		}
	}

	const response = await resolve(event);
	return response;
}