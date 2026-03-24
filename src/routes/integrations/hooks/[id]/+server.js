import { error, json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { users, hooks, logs } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

import { BUILD } from '$lib/utils/hooks.js';

export async function POST({ request: req, params }) {
	const user = (await db.select().from(users).where(eq(users.id, params.id)))?.[0];
	if(!user) return error(404, 'Endpoint not found.');
	if(!user.key) return error(400, 'Setup incomplete for this system.');


	const data = await req.json();
	console.log(data);

	if(user.key !== data.signing_token) return error(401, 'Invalid signing token.');
	if(data.type == 'PING') {
		if(data.system_id !== user.systemId) {
			await db.update(users).set({ systemId: data.system_id }).where(eq(users.id, user.id));
		}
		return json({ success: true });
	}

	const hook = (await db.select().from(hooks).where(and(
		eq(hooks.userId, params.id),
		eq(hooks.event, data.type)
	)))?.[0];
	if(!hook) return error(400, 'No hook set up for that event.');

	console.log(`Dispatching webhook: ${hook.id}`, hook, data);
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