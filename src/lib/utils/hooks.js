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

function handlePrivacy(obj) {
	return Object.keys(obj).map(x => `> - **${x}**: ${obj[x]}`).join('\n');
}

function handleProxyTags(obj) {
	if(!obj?.length) return '> all proxy tags removed';
	return obj.map(x => `> \`${x.prefix ?? ''}text${x.suffix ?? ''}\``).join('\n');
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
		return await EVENTS[evt.type](evt);
	}
}

export const BUILD = async (event, hook, embed) => {
	let comps = [];
	let pcomps;
	let hitPayload = false;
	for(var c of embed.format) {
		if(c.type == 'payload') hitPayload = true;
		let x = await COMPONENTS[c.type](c, event);
		comps = comps.concat(x);
	}

	if(!hitPayload) { // add payload info at bottom if it wasn't in components
		pcomps = await EVENTS[event.type](event);
		comps = comps.concat(pcomps);
	}

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

export const EVENTS = {
	'UPDATE_SYSTEM': async (event) => {
		let { data } = event;

		let content = '';
		for(var k in data) {
			if(k == 'privacy') {
				content += `**privacy:**\n` + handlePrivacy(data[k]) + '\n';
			} else content += `**${k}**: ${data[k]}\n`;
		}

		return [TEXT({ content })];
	},
	'UPDATE_SETTINGS': async (event) => {
		let { data } = event;

		let content = '';
		for(var k in data) {
			content += `**${k}**: ${data[k]}\n`
		}

		return [TEXT({ content })];
	},
	
	'CREATE_MEMBER': async (event) => {
		let { data } = event;

		let content = `**member ID:** \`${event.id}\``;
		for(var k in data) {
			switch(k) {
				case 'privacy':
					content += `**privacy:**\n` + handlePrivacy(data[k]) + '\n';
					break;
				case 'proxy_tags':
					content += `**proxy_tags:**\n` + handleProxyTags(data[k]) + '\n';
					break;
				default:
					content += `**${k}**: ${data[k]}\n`;
			}
		}

		return [TEXT({ content })];
	},
	'UPDATE_MEMBER': async (event) => {
		let { data } = event;

		let content = `**member ID:** \`${event.id}\``;
		for(var k in data) {
			switch(k) {
				case 'privacy':
					content += `**privacy:**\n` + handlePrivacy(data[k]) + '\n';
					break;
				case 'proxy_tags':
					content += `**proxy_tags:**\n` + handleProxyTags(data[k]) + '\n';
					break;
				default:
					content += `**${k}**: ${data[k]}\n`;
			}
		}

		return [TEXT({ content })];
	},
	'DELETE_MEMBER': async (event) => {
		let content = `**deleted member ID:** \`${event.id}\``;

		return [TEXT({ content })];
	},
	
	'CREATE_GROUP': async (event) => {
		let { data } = event;

		let content = `**group ID:** \`${event.id}\``;
		for(var k in data) {
			if(k == 'privacy') {
				content += `**privacy:**\n` + handlePrivacy(data[k]) + '\n';
			} else content += `**${k}**: ${data[k]}\n`;
		}

		return [TEXT({ content })];
	},
	'UPDATE_GROUP': async (event) => {
		let { data } = event;

		let content = `**group ID:** \`${event.id}\``;
		for(var k in data) {
			if(k == 'privacy') {
				content += `**privacy:**\n` + handlePrivacy(data[k]) + '\n';
			} else content += `**${k}**: ${data[k]}\n`;
		}

		return [TEXT({ content })];
	},
	// doesn't seem to get sent? can't test atm
	// 'UPDATE_GROUP_MEMBERS': async (event) => {},
	'DELETE_GROUP': async (event) => {
		let content = `**deleted group ID:** \`${event.id}\``;

		return [TEXT({ content })];
	},
	
	'LINK_ACCOUNT': async (event) => {
		let content = `**account:** <@${event.id}> (\`${event.id}\`)`;

		return [TEXT({ content })];
	},
	'UNLINK_ACCOUNT': async (event) => {
		let content = `**account:** <@${event.id}> (\`${event.id}\`)`;

		return [TEXT({ content })];
	},
	
	'UPDATE_SYSTEM_GUILD': async (event) => {
		let { data } = event;

		let content = '';
		for(var k in data) {
			content += `**${k}**: ${data[k]}\n`;
		}

		return [TEXT({ content })];
	},
	'UPDATE_MEMBER_GUILD': async (event) => {
		let { data } = event;

		let content = '';
		for(var k in data) {
			content += `**${k}**: ${data[k]}\n`;
		}

		return [TEXT({ content })];
	},
	
	'CREATE_MESSAGE': async (event) => {
		let { data } = event;
		let content = [
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

		let content = `**switch ID:** \`${event.id}\`\n**members:**\n`;
		if(members?.length) {
			content += members.map((m) => `> - ${m.name}`).join('\n');
		} else {
			content += '(all fronters switched out)*'
		}

		content += `\n-# Timestamp: ${TIMESTAMP(new Date(data.timestamp))}`;

		comps.push(TEXT({ content }))

		return comps;
	},
	'UPDATE_SWITCH': async (event) => {
		let { data } = event;
		let comps = [];

		let system;
		let members;
		if(data.members) {
			try {
				system = await client.getSystem({ system: event.system_id, fetch: ['members'] });
				members = Array.from(system.members).map(([k, m]) => m);
				members = members.filter((m) => data.members.includes(m.uuid));
			} catch(e) {
				console.error(e);
				return { success: false, err: e.message ?? e };
			}
		}

		let content = `**switch ID:** \`${event.id}\`\n**members:**\n`;
		if(members?.length) {
			content += members.map((m) => `> - ${m.name}`).join('\n');
		} else if(data.member && !members?.length) {
			content += '(all fronters switched out)*'
		}

		if(data.timestamp) content += `\n-# Timestamp: ${TIMESTAMP(new Date(data.timestamp))}`;

		comps.push(TEXT({ content }))

		return comps;
	},
	'DELETE_SWITCH': async (event) => {
		let content = `**deleted switch ID:** \`${event.id}\``;

		return [TEXT({ content })];
	},
	'DELETE_ALL_SWITCHES': async (event) => {
		let content = `(event has no data)`;

		return [TEXT({ content })];
	},
	
	'SUCCESSFUL_IMPORT': async (event) => {
		let content = '(event has no data)';

		return [TEXT({ content })];
	},
	
	'UPDATE_AUTOPROXY': async (event) => {
		let { data } = event;

		let member;
		let mtext = '';
		if(data.autoproxy_member?.length) {
			try {
				member = await client.getMember({ member: data.autoproxy_member});
			} catch(e) {
				console.error(e);
				return { success: false, err: e.message ?? e };
			}
			mtext = `${member.name} (\`${member.id}\`)`
		} else mtext = '(member cleared)';

		let content = '';
		for(var k in data) {
			if(k == 'autoproxy_member') content += `**${k}**: ${mtext}\n`
			else content += `**${k}**: \`${data[k]}\`\n`;
		}

		return [TEXT({ content })];
	},
}