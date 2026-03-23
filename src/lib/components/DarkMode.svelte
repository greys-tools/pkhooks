<script>
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	import { settings, update } from '$lib/stores/settings.svelte.js';

	let { class: classes = "" } = $props();

	let mode = $derived(settings.get('mode'));

	const toggle = () => {
		update('mode', mode == 'dark' ? 'light' : 'dark');
	}
</script>

<button onclick={toggle} class={`btn hover:bg-surface-950/5 hover:dark:bg-surface-50/5 ${classes ?? ''}`}
	aria-label={`toggle ${mode == 'dark' ? 'light' : 'dark'} mode`}
>
	{#if mode == 'dark'}
		<SunIcon />
	{:else}
		<MoonIcon />
	{/if}
</button>