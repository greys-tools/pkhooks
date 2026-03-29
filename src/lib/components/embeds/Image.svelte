<script>
	let { data } = $props();

	let url = $derived(data.url);
	let alt = $derived(data.alt);
</script>

<div class="w-full">
	<img class="rounded-md" src={url} alt={alt ?? "Image"} />
</div>