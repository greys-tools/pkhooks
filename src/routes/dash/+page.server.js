import { redirect, fail } from '@sveltejs/kit';

import { stores } from '$lib/server/db';
import { DISCORD } from '$lib/constants.js';

export async function load({ locals }) {
	if(!locals?.user) return redirect(307, '/');

	let u = await stores.users.get(locals.user.id);

	return { hooks: u.hooks, user: u };
}

export const actions = {
	create: async ({ request, locals }) => {
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();

		let name = fd.get('name')
		if(!name?.length) return fail(400, { success: false, err: 'Name is required.'})

		let url = fd.get('url');
		if(!url?.length) return fail(400, { success: false, err: 'URL is required.'});
		if(!url.match(DISCORD.regex)?.length) return fail(400, { success: false, err: 'URL must be a Discord webhook link.'});
		
		let hook = await stores.hooks.create({
			userId: locals.user.id,
			name,
			url,
		});

		return { success: true, hook };
	},
	edit: async ({ request, locals }) => {
		console.log('edit sent');
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();
		console.log(fd);
		let id = fd.get('id');
		if(!id?.length) return fail(400, { success: false, err: 'Hook ID missing.' });

		let hook = await stores.hooks.get(id);
		console.log(hook);
		if(!hook?.id) return fail(404, { success: false, err: 'Hook not found.' });

		let name = fd.get('name');
		if(!name?.length) return fail(400, { success: false, err: 'Hook name required.' });
		let url = fd.get('url');
		hook.name = name;
		hook.url = url;
		await hook.save();
		
		return { success: true, hook };
	},
	key: async ({ request, locals }) => {
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();
		let key = fd.get('key');
		let info = fd.get('info');

		let user = await stores.users.get(locals.user.id);
		user.key = key;
		await user.save();

		return { success: true, user, info: !!info };
	},
	setembed: async ({ request, locals }) => {
		if(!locals?.user) return fail(401, { success: false, err: 'Must be logged in.' });

		let fd = await request.formData();
		let hook = fd.get('hook');
		let event = fd.get('event');
		let format = fd.get('format');
		let data = fd.get('data');
		let color = fd.get('color');

		if(format?.length) format = JSON.parse(format);
		else format = {};
		if(data?.length) format = JSON.parse(data);
		else data = {};

		data.color = color.replace('#', '');

		let all = await stores.embeds.getByEvent(locals.user.id, event);
		let embed;
		if(all?.length) embed = all.find(x => x.hookId == hook);
		console.log(all, embed);

		if(embed) {
			embed.format = format;
			embed.data = data;
			await embed.save();
		} else {
			embed = await stores.embeds.create({
				userId: locals.user.id,
				hookId: hook,
				event,
				format,
				data,
			});
		}

		return { success: true, embed };
	},
}