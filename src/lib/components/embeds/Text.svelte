<script>
	import { converter } from '$lib/utils/hooks';
	import twemoji from 'twemoji';
	let { data } = $props();
	let { config } = data;
	let conv = $derived.by(() => twemoji.parse(converter.makeHtml(config.content)));
</script>

<div class="text-comp">
	{@html conv}
</div>