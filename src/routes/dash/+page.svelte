<script>
	import { PUBLIC_HOST } from '$env/static/public';
	import { enhance } from '$app/forms';
	
	import { slide } from 'svelte/transition';
	import Hook from '$lib/components/Hook.svelte';
	import NewPanel from '$lib/components/NewPanel.svelte';
	import Info from '$lib/components/Info.svelte';

	import {
		Clipboard as Copy,
		KeyRound as Key,
		Save,
		CircleQuestionMark as Q,
		Plus,
		X,
	} from '@lucide/svelte';

	import { toaster } from '$lib/stores/toaster.js';
	import { enhancedUpdate as upd } from '$lib/utils/misc.js';

	let { data, form } = $props();
	let panel = $state(false);
	let showKey = $state(false);
	let inform = $derived(form?.info);
	let showInfo = $state(inform ?? false);
	let hooks = $derived(data.hooks);

	let siteHook = $derived(`${PUBLIC_HOST}/integrations/hooks/${data.user.id}`);
	let copy = async () => {
		await navigator.clipboard.writeText(siteHook)
		.then(() => toaster.success({
			title: 'Success',
			description: 'Copied URL to clipboard.'
		}))
		.catch((e) => toaster.error({
			title: 'Error',
			description: 'Couldn\'t copy URL to clipboard.'
		}))
	}
</script>

<Info bind:open={showInfo} {copy} key={data.user.key} />

<div class="grid grid-cols-[1fr_auto] mb-4 items-center">
	<h1 class="h1">
		Dash
	</h1>

	<div class="flex flex-row items-center space-x-2">
		<button class="btn rounded-md bg-surface-100 hover:bg-surface-200/50 dark:bg-surface-800 dark:hover:bg-surface-700/50 p-2" onclick={() => showInfo = !showInfo}>
			<Q />
		</button>
		<button class="btn rounded-md bg-surface-100 hover:bg-surface-200/50 dark:bg-surface-800 dark:hover:bg-surface-700/50 p-2" onclick={() => showKey = !showKey}>
			<Key />
		</button>
		<button class="btn rounded-md bg-surface-100 hover:bg-surface-200/50 dark:bg-surface-800 dark:hover:bg-surface-700/50 p-2" onclick={() => copy()}>
			<Copy />
		</button>
		{#if panel}
			<button
				class="btn rounded-md bg-error-500 hover:bg-error-400 p-2 text-white"
				onclick={() => panel = false}
			>
				<X />
			</button>
		{:else}
			<button
				class="btn rounded-md bg-primary-500 hover:bg-primary-400 p-2 text-white"
				onclick={() => panel = true}
			>
				<Plus />
			</button>
		{/if}
	</div>
</div>

{#if showKey}
	<form class="w-full grid grid-cols-[1fr_auto] mb-4 gap-2" method="POST" action="?/key" transition:slide use:enhance={upd}>
		<input class="input" type="text" name="key" value={data.user.key} />
		<button type="submit" class="btn rounded-md bg-primary-500 hover:bg-primary-400 p-2">
			<Save />
		</button>
	</form>
{/if}

<NewPanel bind:open={panel} />

<div class="w-full flex flex-col items-center justify-center text-center space-y-2">
	{#if data?.hooks?.length}
		{#each data.hooks as hook (hook.id)}
			<Hook data={hook} open={form?.hook?.id == hook.id} />
		{/each}
	{:else}
		<p class="text-xl">No hooks yet. Why not make one?</p>
	{/if}
</div>