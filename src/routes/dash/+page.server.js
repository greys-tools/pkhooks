import { redirect, fail } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { hooks } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

import { DISCORD } from '$lib/constants.js';

export async function load({ locals }) {
	if(!locals?.user) return redirect(307, '/');

	let h = await db.select().from(hooks).where(eq(hooks.userId, locals.user.id));
	console.log(h);

	return { hooks: h, user: locals.user };
}

export const actions = {
	create: async ({ request, locals }) => {
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();
		let name = fd.get('name');
		if(!name?.length) return fail(400, { success: false, err: 'Name is required.'});

		let url = fd.get('url');
		if(!url?.length) return fail(400, { success: false, err: 'URL is required.'});
		if(!url.match(DISCORD.regex)?.length) return fail(400, { success: false, err: 'URL must be a Discord webhook link.'});
		
		let events = fd.get('events');
		if(!events?.length) return fail(400, { success: false, err: 'Events are required.' });
		events = events.split(',');

		let hook = await db.insert(hooks).values({
			userId: locals.user.id,
			name,
			url,
			events
		}).returning();

		return { success: true, hook: hook[0] };
	},
	edit: async ({ request, locals }) => {
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();
		let id = fd.get('id');
		if(!id?.length) return fail(400, { success: false, err: 'Hook ID missing.' });

		let exists = await db.select().from(hooks).where(and(
			eq(hooks.id, id),
			eq(hooks.userId, locals.user.id)
		));

		if(!exists?.[0]) return fail(404, { success: false, err: 'Hook not found.' });
		
		let name = fd.get('name');
		if(!name?.length) return fail(400, { success: false, err: 'Name is required.'});

		let events = fd.get('events');
		if(!events?.length) return fail(400, { success: false, err: 'Events are required.' });
		events = events.split(',');

		let key = fd.get('key');

		let hook = await db.update(hooks).set({
			name,
			events,
			key
		}).where(eq(hooks.id, id)).returning();

		return { success: true, hook: hook[0] };
	},
}