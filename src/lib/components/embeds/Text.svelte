<script>
	import { converter } from '$lib/utils/hooks';
	let { data } = $props();
	let conv = $derived.by(() => converter.makeHtml(data));
</script>

<div class="text-comp">
	{@html conv}
</div>