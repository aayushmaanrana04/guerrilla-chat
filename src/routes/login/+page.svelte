<script>
	import { app } from '../../lib/firebase';
	import '$lib/app.css';
	import {
		getAuth,
		signInWithPopup,
		GoogleAuthProvider,
		signOut,
		onAuthStateChanged
	} from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { onMount, onDestroy } from 'svelte';
	import Chat from '../chat/+page.svelte';
	const userID = writable(null);

	const auth = getAuth();
	let unsub = onAuthStateChanged(auth, (user) => {
		if (user) {
			const email = user.email;
			userID.set(email);
			// goto('/chat');
		} else {
			userID.set(null);
		}
	});

	export const email = writable(null);

	async function logout() {
		const auth = getAuth(app);
		signOut(auth)
			.then(() => {
				console.log('user signed out');
			})
			.catch((e) => {
				console.log(e);
			});
	}

	async function login() {
		const auth = getAuth(app);
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			if (result) {
				console.log('user logged in');
			}
		} catch (e) {
			console.log(e);
		}
	}

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});
</script>

<section>
	{#if $userID}
		<!-- <h1>{$userID}</h1> -->
		<Chat />
		<!-- <button on:click={logout}>Logout</button> -->
	{:else}
		<button class="loginwithgoogle" on:click={login}>Login with Google</button>
	{/if}
</section>
