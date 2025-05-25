<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { queryClient } from '$lib/orpc';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import Header from '../components/Header.svelte';

	setMode('dark');

	const { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
