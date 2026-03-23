import { error, json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { hooks, logs } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

import { BUILD } from '$lib/utils/hooks.js';

export async function POST({ request: req, params }) {
	const hook = (await db.select().from(hooks).where(eq(hooks.id, params.id)))?.[0];
	if(!hook) return error(404, 'Hook not found.');

	const data = await req.json();
	console.log(data);
	if(hook.key !== data.signing_token) return error(401, 'Invalid signing token.');
	
	if(data.type == 'PING') return json({ success: true });
	if(!hook.events.includes(data.type)) return json({ message: 'Event not accepted on this webhook.' });

	console.log('doing the webhook...');
	let resp;
	try {
		let built = await BUILD(data, hook.data);
		if(built.err) throw new Error(built);
		resp = await fetch(`${hook.url}?with_components=true`, {
			method: 'POST',
			body: JSON.stringify(built),
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch(e) {
		console.error(e);
		await db.insert(logs).values({
			userId: hook.userId,
			hookId: hook.id,
			status: 'Error',
			data: {
				event: data.event,
				message: e.message
			}
		})
		return error(500, e?.message || "Internal error");
	}

	if(!resp.ok) {
		await db.insert(logs).values({
			userId: hook.userId,
			hookId: hook.id,
			status: 'Error',
			data: {
				event: data.event,
				status: resp.status,
				message: await resp.text()
			}
		})
		return error(resp.status, resp.statusText);
	}

	await db.insert(logs).values({
		userId: hook.userId,
		hookId: hook.id,
		status: 'Success',
		data: {
			event: data.event
		}
	})

	return json({ success: true });
}