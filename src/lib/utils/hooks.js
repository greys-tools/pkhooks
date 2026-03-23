import { PKAPI } from 'pkapi.js';

const client = new PKAPI();

export const BUILD = async (event, hook) => {
	console.log(event);
	let comps = await HOOKS[event.type](event);
	if(comps?.err) return comps;

	return BASE(comps, hook?.color);
}

export const BASE = (comps, color = 'ee8833') => ({
	flags: 1 << 15,
	components: [{
		type: 17,
		accent_color: parseInt(color, 16),
		components: comps
	}]
})

export const TEXT = (content) => ({
	type: 10,
	content
})

export const SEP = () => ({
	type: 14
})

export const TIMESTAMP = (date, format) => `<t:${Math.floor(date.getTime() / 1000)}:${format ?? 'F'}>`;

export const HOOKS = {
	'UPDATE_SYSTEM': () => {},
	'UPDATE_SETTINGS': () => {},
	
	'CREATE_MEMBER': () => {},
	'UPDATE_MEMBER': () => {},
	'DELETE_MEMBER': () => {},
	
	'CREATE_GROUP': () => {},
	'UPDATE_GROUP': () => {},
	'UPDATE_GROUP_MEMBERS': () => {},
	'DELETE_GROUP': () => {},
	
	'LINK_ACCOUNT': () => {},
	'UNLINK_ACCOUNT': () => {},
	
	'UPDATE_SYSTEM_GUILD': () => {},
	'UPDATE_MEMBER_GUILD': () => {},
	
	'CREATE_MESSAGE': () => {},
	
	'CREATE_SWITCH': async (event) => {
		let { data } = event;
		let comps = [];

		let system;
		let members;
		try {
			system = await client.getSystem({ system: event.system_id, fetch: ['members'] });
			members = Array.from(system.members).map(([k, m]) => m);
			members = members.filter((m) => data.members.includes(m.uuid));
		} catch(e) {
			console.error(e);
			return { success: false, err: e.message ?? e };
		}

		comps.push(TEXT('## Switch Logged\n### Members'));
		if(members?.length) {
			comps.push(TEXT(members.map((m) => `- ${m.name}`).join('\n')));
		} else {
			comps.push(TEXT('*All fronters switched out.*'));
		}

		comps.push(SEP());
		comps.push(TEXT(`-# Timestamp: ${TIMESTAMP(new Date(data.timestamp))} | Switch ID: ${data.id}`))

		return comps;
	},
	'UPDATE_SWITCH': () => {},
	'DELETE_SWITCH': () => {},
	'DELETE_ALL_SWITCHES': () => {},
	
	'SUCCESSFUL_IMPORT': () => {},
	
	'UPDATE_AUTOPROXY': () => {},
}