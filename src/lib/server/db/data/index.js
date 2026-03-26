import EmbedStore, { Embed } from './embeds';
import HookStore, { Hook } from './hooks';
import LogStore, { Log } from './logs';
import TokenStore, { Token } from './tokens';
import UserStore, { User } from './users';

const Stores = {
	embeds: EmbedStore,
	hooks: HookStore,
	logs: LogStore,
	tokens: TokenStore,
	users: UserStore
}
export default Stores;
export {
	Stores,
	Embed,
	EmbedStore,
	Hook,
	HookStore,
	Log,
	LogStore,
	Token,
	TokenStore,
	User,
	UserStore
}