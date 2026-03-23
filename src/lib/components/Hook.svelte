<script>
	import { PUBLIC_HOST } from '$env/static/public';
	import { slide } from 'svelte/transition';
	import {
		Combobox,
		Portal,
		useListCollection,
	} from '@skeletonlabs/skeleton-svelte';
	import {
		Clipboard as Copy,
	} from '@lucide/svelte';
	
	import { EVENTS } from '$lib/constants.js';

	import { toaster } from '$lib/stores/toaster.js';

	let { data, open = $bindable() } = $props();

	let edata = EVENTS.map(x => ({ label: x.toLowerCase(), value: x }));
	let value = $state(data.events);
	let items = $state(edata);
	let collection = $derived(
		useListCollection({
			items: items,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		})
	);

	const onOpenChange = () => {
		items = edata;
	};

	const onInputValueChange = (event) => {
		const filtered = edata.filter((item) => item.value.toLowerCase().includes(event.inputValue.toLowerCase()));
		if (filtered.length > 0) {
			items = filtered;
		} else {
			items = edata;
		}
	};

	const onValueChange = (event) => {
		value = event.value;
	};

	const removeValue = (val) => {
		value = value.filter(x => x != val);
	}

	let siteHook = $derived(`${PUBLIC_HOST}/integrations/hooks/${data.id}`);
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

<div class="w-full rounded-md preset-outlined-surface-300-700">
	<div class="grid grid-cols-[1fr_auto] p-2 border-b border-surface-300-700">
		<p class="text-xl text-left">{data.name}</p>
		{#if open}
			<button class="btn preset-filled-error-500" onclick={() => open = false}>Cancel</button>
		{:else}
			<button class="btn preset-filled-primary-500" onclick={() => open = true}>Edit</button>
		{/if}
	</div>
	{#if open}
		<div transition:slide class="p-2 text-left">
			<form class="space-y-4" method="POST" action="/dash?/edit">
				<input type="hidden" value={data.id} name="id" />
				<label class="label">
					<span class="label-text">Name</span>
					<input class="input" type="text" name="name" placeholder="Name" value={data.name}/>
				</label>
				<label class="label">
					<span class="label-text">Site Hook URL</span>
					<div class="input-group grid-cols-[1fr_auto]">
						<input class="input" type="text" disabled placeholder="Site webhook URL" value={siteHook}/>
						<button type="button" class="btn preset-filled" onclick={copy}>
							<Copy />
						</button>
					</div>
				</label>
				<label class="label">
					<span class="label-text">Discord URL</span>
					<input class="input" type="text" disabled placeholder="Discord webhook URL" value={data.url}/>
				</label>

				<label class="label">
					<span class="label-text">Events</span>
					<input type="hidden" name="events" value={value.join(',')} />
				</label>
				<Combobox placeholder="Search..." {collection} {onOpenChange} {onInputValueChange} {value} {onValueChange} multiple>
					<Combobox.Control>
						<Combobox.Input />
						<Combobox.Trigger />
					</Combobox.Control>
					<Portal>
						<Combobox.Positioner>
							<Combobox.Content class="z-50 max-h-48 overflow-auto">
								{#each items as item (item.value)}
									<Combobox.Item {item}>
										<Combobox.ItemText>{item.label}</Combobox.ItemText>
										<Combobox.ItemIndicator />
									</Combobox.Item>
								{/each}
							</Combobox.Content>
						</Combobox.Positioner>
					</Portal>
				</Combobox>
				<div class="flex flex-wrap gap-2">
					{#each value as item (item)}
						<button type="button" class="badge preset-filled" onclick={() => removeValue(item)}>
							{item}
						</button>
					{/each}
				</div>

				<label class="label">
					<span class="label-text">Signing Key</span>
					<input class="input" type="text" name="key" placeholder="PK webhook signing key" value={data.key}/>
				</label>

				<fieldset class="text-center">
					<button type="submit" class="btn preset-filled-primary-500">Submit</button>
				</fieldset>
			</form>
		</div>
	{/if}
</div>