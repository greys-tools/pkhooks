import Text from './Text.svelte';
import Image from './Image.svelte';
import Separator from './Separator.svelte';
import Payload from './Payload.svelte';

const EmbedComponents = {
	'text': {
		type: 'text',
		component: Text,
		config: {
			content: {
				type: 'text',
				default: "Default text",
			},
		},
	},
	'image': {
		type: 'image',
		component: Image,
		config: {
			url: {
				type: 'text',
				default: "https://cdn.selenated.com/img/hf8rb.png",
			},
			alt: {
				type: 'text',
				default: "Banner",
			},
		},
	},
	'separator': {
		type: 'separator',
		component: Separator,
		config: { },
	},
	'payload': {
		type: 'payload',
		component: Payload,
		config: { },
	},
}

export default EmbedComponents;
export function toData(comp) {
	let { config, ...rest} = comp;
	let cfg = {};
	Object.keys(config).forEach(k => cfg[k] = config[k].default ?? '');
	return { ...rest, config: cfg };
}