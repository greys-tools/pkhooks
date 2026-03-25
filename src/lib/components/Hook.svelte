<script>
	import { enhance } from '$app/forms';
	import { PUBLIC_HOST } from '$env/static/public';
	import { slide } from 'svelte/transition';

	import {
		ChevronRight as Open,
		ChevronDown as Close,
	} from '@lucide/svelte';
	
	import { toaster } from '$lib/stores/toaster.js';
	import { EventNames } from '$lib/constants.js';
	import { enhancedUpdate as upd } from '$lib/utils/misc.js';

	let { data, open = $bindable() } = $props();
</script>

<div class="w-full rounded-md preset-outlined-surface-300-700 p-4">
	<button class="grid grid-cols-[1fr_auto] w-full" onclick={() => open = !open}>
		<p class="text-xl text-left">{data.name}</p>
		{#if open}
			<Close class="size-8" />
		{:else}
			<Open class="size-8" />
		{/if}
	</button>
	{#if open}
		<div transition:slide class="text-left">
			<hr class="my-2 text-surface-500 dark:text-surface-600" />
			<form class="space-y-4" method="POST" action="/dash?/edit" use:enhance={upd}>
				<input type="hidden" value={data.id} name="id" />
				<label class="label">
					<span class="label-text">Discord URL</span>
					<input class="input" type="text" name="url" placeholder="Discord webhook URL" value={data.url}/>
				</label>
	
				<fieldset class="text-center">
					<button type="submit" class="btn preset-filled-primary-500">Submit</button>
				</fieldset>
			</form>
		</div>
	{/if}
</div>