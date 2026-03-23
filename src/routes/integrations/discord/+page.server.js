import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import { db } from '$lib/server/db';
import { users, tokens } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

import jwt from 'jsonwebtoken';

import { DISCORD } from '$lib/constants.js';

const SECRET = env.DISCORD_CLIENT_SECRET;

const pfp = (id) => `${DISCORD.avatars}/${id.id}/${id.avatar}.png`;

export async function load({ request: req, url, cookies }) {	
	const code = url.searchParams.get('code');
	if(!code?.length) {
		const err = url.searchParams.get('error_description');
		return { error: err }
	}

	let tk, identity;
	try {
		const resp = await fetch(`${DISCORD.api}/oauth2/token`, {
			method: 'POST',
			body: new URLSearchParams({
		    'grant_type': 'authorization_code',
		    'code': code,
		    'redirect_uri': DISCORD.redirect,
		    'client_id': DISCORD.client,
		    'client_secret': SECRET
		  }),
		  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		tk = await resp.json();

		const idresp = await fetch(`${DISCORD.api}/users/@me`, {
			headers: {
				'Authorization': `Bearer ${tk.access_token}`
			}
		});
		identity = await idresp.json();
	} catch(e) {
		console.error(e);
		return { error: e.message ?? e }
	}

	let exists = await db.select().from(users).where(eq(users.discordId, identity?.id));
	if(!exists?.[0] && identity) {
		exists = await db.insert(users).values({
			discordId: identity.id,
			name: identity.username,
			avatar: pfp(identity)
		}).returning();
	} else {
		// update user info if needed
		await db.update(users).set({
			avatar: pfp(identity),
			name: identity.username,
		}).where(eq(users.discordId, identity.id));
	}

	exists = exists[0] ?? exists;

	let dbtk = await db.insert(tokens).values({
		userId: exists.id
	}).returning();

	let jwtk = jwt.sign({
		user: exists.id,
		tk: dbtk[0].id
	}, env.JWT_SECRET);

	cookies.set('token', jwtk, { path: '/', expires: dbtk[0].expires });

	return { user: exists, token: jwtk }
}