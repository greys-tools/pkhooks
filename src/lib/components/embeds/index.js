import Text from './Text.svelte';
import Image from './Image.svelte';

const EmbedComponents = {
	'text': {
		component: Text,
		config: {
			content: {
				type: 'text'
			}
		},
	},
	'image': {
		component: Image,
		config: {
			url: {
				type: 'text'
			},
			alt: {
				type: 'text'
			}
		}
	}
}

export default EmbedComponents;