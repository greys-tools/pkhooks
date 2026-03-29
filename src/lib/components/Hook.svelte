<script>
	import { enhance } from '$app/forms';
	import { PUBLIC_HOST } from '$env/static/public';
	import { slide } from 'svelte/transition';

	import {
		ChevronRight as Open,
		ChevronDown as Close,
		Save,
	} from '@lucide/svelte';
	
	import { toaster } from '$lib/stores/toaster.js';
	import { EVENTS, EventNames } from '$lib/constants.js';
	import { enhancedUpdate as upd } from '$lib/utils/misc.js';
	import EmbedComponents from '$lib/components/embeds/index.js';

	let { data, open = $bindable() } = $props();
	let event = $state(EVENTS[0]);
	let selected = $derived.by(() => data.embeds.find(x => x.event == event));
	let color = $derived.by(() => selected?.data?.color ? `#${selected.data.color}` : "#aaaaaa");
	let comps = $derived.by(() => selected?.format ?? []);
</script>

<div class="w-full rounded-md preset-outlined-surface-300-700 p-4">
	<button class="grid grid-cols-[1fr_auto] w-full" onclick={() => open = !open}>
		<p class="text-xl text-left font-bold">{data.name}</p>
		{#if open}
			<Close class="size-8" />
		{:else}
			<Open class="size-8" />
		{/if}
	</button>
	{#if open}
		<div transition:slide class="text-left">
			<hr class="my-2 hr border-t-3" />
			<p class="text-lg font-bold">Hook Info</p>
			<form class="w-full space-y-4" method="POST" action="/dash?/edit" use:enhance={upd}>
				<input type="hidden" value={data.id} name="id" />
				<label class="label">
					<span class="">Name</span>
					<input class="input" type="text" name="name" value={data.name} placeholder='Hook name' />
				</label>

				<label class="label">
					<span class="">Discord URL</span>
					<input class="input" type="text" name="url" value={data.url} placeholder='Discord webhook URL' />
				</label>

				<fieldset class="text-center">
					<button type="submit" class="btn preset-filled-primary-500">Submit</button>
				</fieldset>
			</form>

			<hr class="my-4 hr border-t-3" />

			<p class="text-lg font-bold">Embeds</p>
			<form class="space-y-4" method="POST" action="/dash?/setembed" use:enhance={upd}>
				<input type="hidden" value={data.id} name="hook" />
				<label class="label">
					<span class="">Event</span>
					<div class="grid grid-cols-[1fr_auto] mb-4 gap-2">
						<select class="select" name="event" bind:value={event}>
							{#each EVENTS as evt}
								<option value={evt}>{EventNames.get(evt)}</option>
							{/each}
						</select>
						<button type="submit" class="btn rounded-md bg-primary-500 hover:bg-primary-400 p-2">
							<Save />
						</button>
					</div>
				</label>

				<div class="grid grid-cols-[auto_1fr] gap-2">
					<input class="input" type="color" bind:value={color} />
					<input class="input" type="text" bind:value={color} readonly tabindex="-1" name='color' />
				</div>

				<div class="grid grid-rows-2 gap-2 md:grid-cols-2 md:grid-rows-1">
					<div class="card p-0 overflow-hidden rounded-sm border border-surface-100/50 dark:border-surface-700 dark:bg-surface-800/50 ">
						<div class="p-4 border-l-3" style={`border-color: ${color}`}>
							<EmbedComponents.text.component data={`# Test\n## Test 2\n### Test 3\nnormal text **bold text** *italic text*\n-# small text\n-# more small text`} />
							<EmbedComponents.image.component data={{ url: 'https://cdn.selenated.com/img/hf8rb.png', alt: 'banner' }} />
						</div>
					</div>

					<div class="">
					</div>
				</div>
			</form>
		</div>
	{/if}
</div>