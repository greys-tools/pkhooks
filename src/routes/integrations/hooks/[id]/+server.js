import { error, json } from '@sveltejs/kit';

import { stores } from '$lib/server/db';
import { BUILD } from '$lib/utils/hooks.js';

export async function POST({ request: req, params }) {
	const user = await stores.users.get(params.id);
	if(!user) return error(404, 'Endpoint not found.');

	const data = await req.json();
	console.log(data);

	if(user.key && user.key !== data.signing_token) return error(401, 'Invalid signing token.');
	if(data.system_id && data.system_id !== user.systemId) {
		await db.update(users).set({ systemId: data.system_id }).where(eq(users.id, user.id));
	}
	if(data.type == 'PING') {
		return json({ success: true });
	}

	const embeds = await stores.embeds.getByEvent(user.id, data.type);
	if(!embeds?.length) return json({ success: true, message: 'No embeds for that event; nothing to do.' });

	let errors = [];

	for(let em of embeds) {
		let { hook } = em;
		console.log(`Dispatching webhook: ${hook.id}`, hook, data);
		
		let resp;
		try {
			let built = await BUILD(data, hook, em);
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
			await stores.logs.create({
				userId: hook.userId,
				hookId: hook.id,
				status: 'Error',
				data: {
					event: data.event,
					message: e.message
				}
			})
			errors.push({
				message: e.message
			})
		}

		if(resp.ok) {
			await db.insert(logs).values({
				userId: hook.userId,
				hookId: hook.id,
				status: errors.length ? 'Error' : 'Success',
				data: {
					event: data.event,
					errors
				}
			})
		} else {
			let errtext = await resp.text();
			await db.insert(logs).values({
				userId: hook.userId,
				hookId: hook.id,
				status: 'Error',
				data: {
					event: data.event,
					status: resp.status,
					message: errtext
				}
			})

			errors.push({
				status: resp.status,
				message: errtext
			})
		}
	}

	console.log(errors);
	return json({ success: !errors.length, errors });
}

export async function GET({ request }) {
	return json({ success: true });
}