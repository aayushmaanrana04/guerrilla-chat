<script>
	import Login from './login/+page.svelte';
	import Chat from './chat/+page.svelte';
	import '$lib/app.css';
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { emailStore } from '../stores/stores';

	import { onDestroy } from 'svelte';

	const unsubscribe = onAuthStateChanged(auth, (user) => {
		if (user) {
			$emailStore = user.email;
		} else {
			$emailStore = null;
		}
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});
</script>

<main>
	{#if !$emailStore}
		<Login />
	{:else}
		<Chat />
	{/if}
</main>
