<script>
	let { data } = $props();

	let url = $derived(data.config.url);
	let alt = $derived(data.config.alt);
</script>

<div class="w-full">
	<img class="rounded-md" src={url} alt={alt ?? "Image"} />
</div>