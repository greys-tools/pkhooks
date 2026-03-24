<script>
	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	import { EVENTS, EventNames } from '$lib/constants.js';
	import { enhancedUpdate as upd } from '$lib/utils/misc.js';

	let { open = $bindable() } = $props();
	let filtered = $derived.by(() => EVENTS.filter(x => !page.data.events.includes(x)));
</script>

{#if open}
<div class="w-full preset-outlined-surface-300-700 mb-2 rounded-md" transition:slide>
	<div class="w-full border-b border-surface-300-700 p-2">
		<h3 class="h3">New Hook</h3>
	</div>
	<div class="w-full p-4">
		<form class="space-y-4" method="POST" action="/dash?/create" use:enhance={upd}>
			<label class="label">
				<span class="label-text">Webhook URL</span>
				<input class="input" type="text" name="url" placeholder="Discord webhook URL" />
			</label>

			<label class="label">
				<span class="label-text">Event</span>
				<select class="select">
					{#each filtered as evt}
						<option value={evt}>{EventNames.get(evt)}</option>
					{/each}
				</select>
			</label>

			<fieldset class="text-center">
				<button type="submit" class="btn preset-filled-primary-500 text-white">Submit</button>
			</fieldset>
		</form>
	</div>
</div>
{/if}