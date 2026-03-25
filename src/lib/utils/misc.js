import { applyAction } from '$app/forms';
import { goto, invalidateAll } from '$app/navigation';

export const formatName = (str) => {
	let parts = str.split('_');
	parts = parts.map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase());

	return parts.join(" ");
}

export const enhancedUpdate = ({formElement, formData, action, cancel}) => {
	return async ({ result }) => {
		if(result.type === 'redirect') {
			goto(result.location);
		} else {
			await invalidateAll();
			await applyAction(result);
		}
	}
}