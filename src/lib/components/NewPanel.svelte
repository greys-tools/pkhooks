<script>
	import { slide } from 'svelte/transition';

	import {
		Combobox,
		Portal,
		useListCollection,
	} from '@skeletonlabs/skeleton-svelte';

	import { EVENTS } from '$lib/constants.js';

	let { open = $bindable() } = $props();

	let edata = EVENTS.map(x => ({ label: x.toLowerCase(), value: x }));
	let value = $state([]);
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
</script>

{#if open}
<div class="w-full preset-outlined-surface-300-700 mb-2 rounded-md" transition:slide>
	<div class="w-full border-b border-surface-300-700 p-2">
		<h3 class="h3">New Hook</h3>
	</div>
	<div class="w-full p-4">
		<form class="space-y-4" method="POST" action="/dash?/create">
			<label class="label">
				<span class="label-text">Name</span>
				<input class="input" type="text" name="name" placeholder="Name" />
			</label>
			<label class="label">
				<span class="label-text">Webhook URL</span>
				<input class="input" type="text" name="url" placeholder="Discord webhook URL" />
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

			<fieldset class="text-center">
				<button type="submit" class="btn preset-filled-primary-500">Submit</button>
			</fieldset>
		</form>
	</div>
</div>
{/if}