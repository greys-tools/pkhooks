import { PKAPI } from 'pkapi.js';
import showdown from 'showdown';

export const client = new PKAPI();
export const converter = new showdown.Converter({
	simplifiedAutoLink: true,
	strikethrough: true,
	simpleLineBreaks: true,
	requireSpaceBeforeHeadingText: true,
	openLinksInNewWindow: true,
	underline: true,
	emoji: true,
	ellipsis: false,
	extensions: [handleSmallText, handleCustomEmojis]
});

function handleSmallText() {
	return ({
		type: 'lang',
		filter: function(text, conv, options) {
			let regex = /^-# (.*)/gm;
			for(let match of text.matchAll(regex)) {
				text = text.replace(match[0], `<small>${match[1]}</small>`)
			}
			
			return text;
		}
	})
}

function handleCustomEmojis() {
	return ({
		type: 'lang',
		filter: function(text) {
			let regex = /<(?<gif>a)?:(?<name>\w+):(?<id>\d+)>/g;
			for(let match of text.matchAll(regex)) {
				text = text.replace(match[0], customEmoji(match.groups));
			}
			
			return text;
		}
	})
}

function customEmoji(data) {
	return `
		<img
			class="emoji"
			src="https://cdn.discordapp.com/emojis/${data.id}.${data.gif ? "gif" : "png"}"
			alt="${data.name + " emoji"}"
		/>
	`.split("\n").join(" ");
		// ^ dumb trick so it doesn't mess with the rest of parsing
		// i just didn't wanna put it all on one line tbh
}

const COMPONENTS = {
	'text': (c) => {
		return [TEXT(c.config)];
	},
	'image': (c) => {
		return [IMAGE(c.config)]
	},
	'separator': (c) => {
		return [SEP()]
	},
	'payload': async (c, evt) => {
		console.log(evt);
		return await HOOKS[evt.type](evt);
	}
}

export const BUILD = async (event, hook, embed) => {
	console.log(event, embed);
	let comps = [];
	let pcomps;
	let hitPayload = false;
	for(var c of embed.format) {
		if(c.type == 'payload') hitPayload = true;
		let x = await COMPONENTS[c.type](c, event);
		comps = comps.concat(x);
	}

	if(!hitPayload) { // add payload info at bottom if it wasn't in components
		pcomps = await HOOKS[event.type](event);
		comps = comps.concat(pcomps);
	}

	console.log(comps);
	return BASE(comps, embed.data?.color);
}

export const BASE = (comps, color = 'ee8833') => ({
	flags: 1 << 15,
	components: [{
		type: 17,
		accent_color: parseInt(color, 16),
		components: comps
	}]
})

export const IMAGE = (data = { }) => ({
	type: 12,
	items: [{
		media: { url: data.url },
		description: data.alt
	}]
})

export const TEXT = ({ content } = { }) => ({
	type: 10,
	content
})

export const SEP = () => ({
	type: 14
})

export const TIMESTAMP = (date, format) => `<t:${Math.floor(date.getTime() / 1000)}:${format ?? 'F'}>`;

export const HOOKS = {
	'UPDATE_SYSTEM': async (event) => {
		let { data } = event;

		let content = `### Data Changed\n`;
		for(var k in data) {
			content += `**${k}**: ${data[k]}\n`
		}

		return [TEXT({ content })];
	},
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
	
	'CREATE_MESSAGE': async (event) => {
		let { data } = event;
		let content = [
			'### Message Info',
			`**Member:** ${data.member.name} (\`${data.member.id}\`)`,
			`**Server:** ${data.guild}`,
			`**Channel:** ${data.channel}`,
			`**Account:** ${data.sender}`,
			`-# Message sent ${TIMESTAMP(new Date(data.timestamp))}`
		].join('\n');

		return [TEXT({ content })]
	},
	
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

		let content = '### Members\n';
		if(members?.length) {
			content += members.map((m) => `- ${m.name}`).join('\n');
		} else {
			content += '*All fronters switched out.*'
		}

		content += `\n-# Timestamp: ${TIMESTAMP(new Date(data.timestamp))}`;

		comps.push(TEXT({ content }))

		return comps;
	},
	'UPDATE_SWITCH': () => {},
	'DELETE_SWITCH': () => {},
	'DELETE_ALL_SWITCHES': () => {},
	
	'SUCCESSFUL_IMPORT': () => {},
	
	'UPDATE_AUTOPROXY': () => {},
}