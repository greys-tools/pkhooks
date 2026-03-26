<script>
	import { enhance } from '$app/forms';

	import { X } from '@lucide/svelte';
	import {
		Dialog,
		Portal
	} from '@skeletonlabs/skeleton-svelte';

	import {
		Clipboard as Copy,
		Save,
	} from '@lucide/svelte';

	import { enhancedUpdate as upd } from '$lib/utils/misc.js';

	const animation =
		'transition transition-discrete opacity-0 translate-y-[10px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[10px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0';

	let { open = $bindable(), copy, key } = $props();
</script>

<Dialog bind:open onOpenChange={(e) => open = e.open}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
		<Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-50 dark:bg-surface-800 border-surface-100 dark:border-surface-700 w-full max-w-xl p-4 space-y-4 shadow-xl {animation} max-h-9/10 flex flex-col justify-between">
				<header class="flex justify-between items-center">
					<Dialog.Title class="text-lg font-bold"><h3 class="h3">Setting Up</h3></Dialog.Title>
					<Dialog.CloseTrigger class="btn-icon hover:preset-tonal">
						<X class="size-4" />
					</Dialog.CloseTrigger>
				</header>
				<Dialog.Description class="space-y-2 overflow-auto p-4">
					<p>
						To get started, click this button to copy your hook URL to the clipboard:
					</p>
					<button class="btn p-1 rounded-md preset-filled-primary-500 text-white" onclick={() => copy()}>
						<Copy />
					</button>
					<p>
						Next, go to your DMs with PluralKit and run the command <code class="code">pk;s hook [url]</code>
						<br/>
						Make sure to replace the [url] part with the URL above, and don't include the [brackets]. <strong>Don't hit the confirm button yet!</strong>
					</p>
					<p>
						PluralKit will give you a <em>signing token</em>. This is how we verify that events are being sent by PK.
						<br/>
						Paste that token here and click the save button:
					</p>
					<form class="w-full grid grid-cols-[1fr_auto] mb-4 gap-2" method="POST" action="/dash?/key" use:enhance={upd}>
						<input class="hidden" type="text" name="info" value="t" />
						<input class="input" type="text" name="key" value={key} />
						<button type="submit" class="btn rounded-md bg-primary-500 hover:bg-primary-400 p-2">
							<Save />
						</button>
					</form>
					<p>
						Now you can <strong>press the confirm button</strong> on PK's message. PK should confirm that your URL is set, and now you can start making webhooks!
					</p>
				</Dialog.Description>
				<footer class="flex justify-end gap-2">
					<Dialog.CloseTrigger class="btn preset-tonal">Okay</Dialog.CloseTrigger>
				</footer>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>