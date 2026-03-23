<script>
	import Hook from '$lib/components/Hook.svelte';
	import NewPanel from '$lib/components/NewPanel.svelte';

	let { data, form } = $props();
	let panel = $state(false);

	$inspect(form)
</script>

<div class="grid grid-cols-[1fr_auto] mb-4 items-center">
	<h1 class="h1">
		Dashboard
	</h1>
	{#if panel}
		<button
			class="btn rounded-md bg-error-500 hover:bg-error-400 h-10"
			onclick={() => panel = false}
		>
			Cancel
		</button>
	{:else}
		<button
			class="btn rounded-md bg-primary-500 hover:bg-primary-400 h-10"
			onclick={() => panel = true}
		>
			Create
		</button>
	{/if}
</div>

<NewPanel bind:open={panel} />

<div class="w-full flex flex-col items-center justify-center text-center">
	{#if data?.hooks?.length}
		{#each data.hooks as hook (hook.id)}
			<Hook data={hook} open={form?.hook?.id == hook.id} />
		{/each}
	{:else}
		<p class="text-xl">No hooks yet. Why not make one?</p>
	{/if}
</div>