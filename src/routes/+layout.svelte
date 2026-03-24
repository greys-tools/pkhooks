<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import DarkMode from '$lib/components/DarkMode.svelte';
	import { LOGIN } from '$lib/constants.js';
	import { toaster } from '$lib/stores/toaster.js';

	import {
		AppBar,
		Toast,
	} from '@skeletonlabs/skeleton-svelte';

	import {
		CircleUser as User,
		X,
	} from '@lucide/svelte';

	let { children: kids, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
    var prefer = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var st;
    if ('settings' in localStorage) {
      st = JSON.parse(localStorage.getItem('settings')); 
    }

    if(st) {
    	if(st.mode == 'dark' || (st.mode == 'system' && prefer)) window.document.documentElement.dataset.mode = 'dark';
      else if(st.mode == 'light') window.document.documentElement.dataset.mode = 'light';

      if(st.theme?.length) window.document.documentElement.dataset.theme = st.theme;
      else window.document.documentElement.dataset.theme = 'concord';
    } else {
    	window.document.documentElement.dataset.theme = 'concord';
    	if(prefer) window.document.documentElement.dataset.mode = 'dark';
    }
  </script>
</svelte:head>

<div class="flex flex-col w-full">
	<AppBar class="sticky top-0 p-1 z-50 backdrop-blur-lg bg-transparent h-12 border-b border-surface-200 dark:border-surface-700">
		<AppBar.Toolbar class="grid-cols-[1fr_auto]">
			<AppBar.Headline class="md:ml-4">
				<a href="/" class="text-2xl">PKHooks</a>
			</AppBar.Headline>
			<AppBar.Trail>
				<DarkMode />
				{#if data?.user}
					<a class="btn rounded-md hover:bg-surface-200 dark:hover:bg-surface-700" href="/dash">
						<img class="h-[32px]" src={data.user.avatar} alt="User avatar" />
						<span>{data.user.name}</span>
					</a>
				{:else}
					<a class="btn" href={LOGIN}>
						<User />
						<span>Log in</span>
					</a>
				{/if}
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<Toast.Group {toaster}>
		{#snippet children(toast)}
			<Toast {toast}>
				<Toast.Message>
					<Toast.Title>{toast.title}</Toast.Title>
					<Toast.Description>{toast.description}</Toast.Description>
				</Toast.Message>
				{#if toast.action}
					<Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
				{/if}
				<Toast.CloseTrigger class="btn p-2 size-auto">
					<X />
				</Toast.CloseTrigger>
			</Toast>
		{/snippet}
	</Toast.Group>

	<div class="p-4 w-full md:max-w-2xl mx-auto">
		{@render kids()}
	</div>
</div>