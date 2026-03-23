<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	onMount(() => {
		if(data.user) goto('/dash');
	})
</script>

{#if data.error}
	<h1 class="h1 text-center">Error</h1>
	<p class="text-center">{data.error}</p>
	<p class="font-bold text-center">Please try authenticating again.</p>
{/if}