import { PUBLIC_HOST } from '$env/static/public';
import { formatName } from '$lib/utils/misc';

export const DISCORD = {
	api: 'https://discord.com/api/v10',
	auth: 'https://discord.com/oauth2/authorize',
	client: '1468601796615209005',
	redirect: `${PUBLIC_HOST}/integrations/discord`,
	avatars: 'https://cdn.discordapp.com/avatars',
	regex: /https:\/\/(canary\.)?discord\.com\/api\/webhooks\/\d{15,}\/.+/i
}

export const LOGIN = (
	DISCORD.auth +
	`?client_id=${DISCORD.client}` +
	`&response_type=code` +
	`&redirect_uri=${encodeURIComponent(DISCORD.redirect)}` +
	`&scope=identify+email`
);

export const EVENTS = [
	'UPDATE_SYSTEM',
	'UPDATE_SETTINGS',
	
	'CREATE_MEMBER',
	'UPDATE_MEMBER',
	'DELETE_MEMBER',
	
	'CREATE_GROUP',
	'UPDATE_GROUP',
	'UPDATE_GROUP_MEMBERS',
	'DELETE_GROUP',
	
	'LINK_ACCOUNT',
	'UNLINK_ACCOUNT',
	
	'UPDATE_SYSTEM_GUILD',
	'UPDATE_MEMBER_GUILD',
	
	'CREATE_MESSAGE',
	
	'CREATE_SWITCH',
	'UPDATE_SWITCH',
	'DELETE_SWITCH',
	'DELETE_ALL_SWITCHES',
	
	'SUCCESSFUL_IMPORT',
	
	'UPDATE_AUTOPROXY',
];

const EventNames = new Map(EVENTS.map(x => [x, formatName(x)]));
export { EventNames }