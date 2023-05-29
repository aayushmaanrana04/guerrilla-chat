<script>
	import { onMount, afterUpdate, onDestroy } from 'svelte';
	import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
	import {
		getFirestore,
		collection,
		getDocs,
		addDoc,
		query,
		orderBy,
		serverTimestamp,
		onSnapshot
	} from 'firebase/firestore';
	import { app } from '$lib/firebase';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import '$lib/app.css';
	import { createAvatar } from '@dicebear/core';
	import { lorelei } from '@dicebear/collection';
	import FaSignOutAlt from 'svelte-icons/fa/FaSignOutAlt.svelte';
	import IoMdSend from 'svelte-icons/io/IoMdSend.svelte';
	const textMsg = writable('');

	let chatbox;
	let inputBox;

	const userID = writable(null);
	const auth = getAuth();
	onAuthStateChanged(auth, (user) => {
		if (user) {
			const uid = user.email;
			userID.set(uid);
		} else {
			userID.set(null);
			// goto('/');
		}
	});

	// const messages = writable([]);
	let messages = [];
	const db = getFirestore(app);
	const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));

	let unsub = onSnapshot(q, (result) => {
		messages = [];
		result.forEach((doc) => {
			messages = [...messages, doc.data()];
			// console.log(messages);
		});
	});

	onMount(() => {
		inputBox.focus();
	});

	onMount(async () => {
		// const resultList = await getDocs(collection(db, 'messages'));
		try {
			const resultList = await getDocs(
				query(collection(db, 'messages'), orderBy('createdAt', 'asc'))
			);
			resultList.forEach((doc) => {
				// messages.update((value) => [...value, doc.data()]);
				// messages = [...messages, doc.data()];
			});
		} catch (e) {
			console.log(e);
		}
	});
	afterUpdate(() => {
		scrollToBottom();
	});
	function scrollToBottom() {
		if (messages) {
			chatbox.scrollTop = chatbox.scrollHeight;
		}
	}
	async function logout() {
		const auth = getAuth(app);
		signOut(auth)
			.then(() => {
				console.log('user signed out');
				goto('/');
			})
			.catch((e) => {
				console.log(e);
			});
	}

	let avatar = createAvatar(lorelei, {
		size: 30
		// ... other options
	}).toDataUriSync();

	async function handleSubmit() {
		if ($textMsg != '') {
			const data = {
				email: $userID,
				message: $textMsg,
				createdAt: serverTimestamp()
			};
			const createdMessage = await addDoc(collection(db, 'messages'), data);
			textMsg.set('');
		}
		// console.log('Doc id', createdMessage.id);
	}

	function handleKeydown(e) {
		if (e.key == 'Enter') {
			handleSubmit();
		}
	}

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});
</script>

<!-- <h1>{$userID}</h1> -->

<!-- {#if $userID == null}
	<h1>could not load your messages</h1>
{/if} -->
<div class="chatBg">
	<button on:click={logout} class="chatLogout">
		<p>{$userID}</p>
		<FaSignOutAlt /></button
	>
	<div class="chatbox" bind:this={chatbox}>
		{#if $userID == null}
			<p class="loader">Loading...</p>
		{/if}
		{#each messages as message}
			<div class={$userID === message.email ? 'av-right' : 'av-left'}>
				<div class={$userID === message.email ? 'msg-right' : 'msg-left'}>
					<p>{message.message}</p>
					<p class="uid">{message.email.replace('@gmail.com', '')}</p>
				</div>
				<img alt="avatar" src={avatar} />
			</div>
		{/each}
	</div>

	<div class="chatTextbox">
		<input bind:this={inputBox} on:keydown={handleKeydown} type="text" bind:value={$textMsg} />
		<button class="submitbtn" on:click={handleSubmit}><IoMdSend /></button>
	</div>
</div>
