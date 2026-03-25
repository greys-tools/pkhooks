import { db } from '$lib/server/db';

export const getUser = async (id, extra = { hooks: true, embeds: true }) => {
	return await db.query.users.findFirst({
		with: extra,
		where: (users, { eq }) => eq(users.id, id)
	})
}

export const getToken = async (id, extra = { user: true }) => {
	let token = await db.query.tokens.findFirst({
		with: extra,
		where: (tokens, { eq }) => eq(tokens.id, id),
	});
	return token;
}