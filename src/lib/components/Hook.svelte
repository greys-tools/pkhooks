<script>
	import { enhance } from '$app/forms';
	import { PUBLIC_HOST } from '$env/static/public';
	import { slide } from 'svelte/transition';
	import { nanoid } from 'nanoid';

	import {
		ChevronRight as Open,
		ChevronDown as Close,
		Save,
		Plus,
	} from '@lucide/svelte';
	
	import { toaster } from '$lib/stores/toaster.js';
	import { EVENTS, EventNames } from '$lib/constants.js';
	import { enhancedUpdate as upd } from '$lib/utils/misc.js';
	import EmbedComponents, { toData } from '$lib/components/embeds/index.js';

	let { data, open = $bindable() } = $props();
	let event = $state(EVENTS[0]);
	let selected = $derived.by(() => data.embeds.find(x => x.event == event));
	let sdata = $state({
		color: selected?.data?.color ? `#${selected.data.color}` : "#aaaaaa",
		comps: Array.isArray(selected?.format) ? selected.format : [],
	});
	let stringed = $derived(JSON.stringify(sdata.comps));
	let ctype = $state('text');
	let scomp = $state({});
	$inspect(sdata.comps, stringed);

	const onSelectChange = ({ target: { value } }) => {
		console.log(value);
		sdata = {
			color: selected?.data?.color ? `#${selected.data.color}` : "#aaaaaa",
			comps: Array.isArray(selected?.format) ? selected.format : [],
		}
		scomp = null;
	}

	const addComp = () => {
		let { component, ...cmp } = EmbedComponents[ctype];
		let cd = toData(cmp);
		cd.id = nanoid();
		sdata.comps = [...sdata.comps, cd];
	}

	const selectComp = (id) => {
		scomp = sdata.comps.find(x => x.id == id);
	}

	const removeComp = () => {
		sdata.comps = sdata.comps.filter(x => x.id !== scomp.id);
		scomp = null;
	}
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
			<h2 class="text-xl font-bold">Hook Info</h2>
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

			<h2 class="text-xl font-bold">Embeds</h2>
			<form class="space-y-4" method="POST" action="/dash?/setembed" use:enhance={upd}>
				<input type="hidden" value={data.id} name="hook" />
				<input type="hidden" value={stringed} name="format-json" />
				<label class="label">
					<span class="">Event</span>
					<div class="grid grid-cols-[1fr_auto] mb-4 gap-2">
						<select class="select" name="event" bind:value={event} onchange={onSelectChange}>
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
					<input class="input" type="color" bind:value={sdata.color} />
					<input class="input" type="text" bind:value={sdata.color} name='color' />
				</div>

				<div class="grid grid-rows-[auto_1fr] gap-2 md:grid-cols-2 md:grid-rows-1">
					<div class="card p-0 overflow-hidden rounded-sm border border-surface-100/50 dark:border-surface-700 dark:bg-surface-800/50">
						<div class="p-4 border-l-3 space-y-2 h-full" style={`border-color: ${sdata.color}`}>
							{#each sdata.comps as comp (comp.id)}
							{@const Component = EmbedComponents[comp.type].component}
								<button
									class={`text-left w-full p-1 hover:ring-2 hover:ring-primary-500 rounded-md ${scomp?.id == comp.id && 'ring-2 ring-primary-500'}`}
									onclick={() => selectComp(comp.id)}
								>
									<Component data={comp} />
								</button>
							{/each}
						</div>
					</div>

					<div class="order-first md:order-last space-y-2">
						<h3 class="text-lg font-bold">Configure Embed</h3>
						<div>
							<h4 class="text-md font-bold">Add component</h4>
							<div class="grid grid-cols-[1fr_auto] gap-2">
								<select class="select" bind:value={ctype}>
									{#each Object.keys(EmbedComponents) as ecomp (ecomp)}
										<option value={ecomp}>{ecomp}</option>
									{/each}
								</select>
								<button type="button" class="btn rounded-md bg-primary-500 hover:bg-primary-400 p-2" onclick={addComp}>
									<Plus />
								</button>
							</div>
							{#if scomp?.id}
								<h4 class="text-md font-bold">Configure Component</h4>
								<div class="space-y-4">
									{#each Object.keys(EmbedComponents[scomp.type].config) as key (key)}
										{@const TYPE = EmbedComponents[scomp.type].config[key]}
										<label class="label">
											<span>{key}</span>
											<input class="input" placeholder={key} type={TYPE.type} bind:value={scomp.config[key]} />
										</label>
									{/each}
									<button class="btn bg-error-500" onclick={removeComp}>Delete</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</form>
		</div>
	{/if}
</div>