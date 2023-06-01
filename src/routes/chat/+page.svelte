<script>
	import '$lib/app.css';
	import { onMount, afterUpdate, onDestroy } from 'svelte';
	//firebase
	import { app, auth, db } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import {
		collection,
		addDoc,
		query,
		orderBy,
		serverTimestamp,
		onSnapshot
	} from 'firebase/firestore';
	import { fetchAndActivate, getRemoteConfig, getString, getValue } from 'firebase/remote-config';

	//avatar + icons
	import { createAvatar } from '@dicebear/core';
	import { micah as av_style } from '@dicebear/collection';
	import FaSignOutAlt from 'svelte-icons/fa/FaSignOutAlt.svelte';
	import IoMdSend from 'svelte-icons/io/IoMdSend.svelte';

	//store
	import { emailStore, textMsg, jsonStore, changeClass } from '../../stores/stores';

	let chatbox;
	let inputBox;
	let messages = [];

	$jsonStore = {
		color: 'default color',
		size: 'default size',
		name: {
			firstName: 'first name',
			lastName: 'last name'
		},
		array: [0, 1, 2, 3, 4]
	}; //initialized default json

	//update on change in db
	const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));

	let unsubscribe = onSnapshot(q, (result) => {
		messages = [];
		result.forEach((doc) => {
			messages = [...messages, doc.data()];
		});
	});

	//UI
	const remoteConfig = getRemoteConfig(app); //could'nt declare in firebase because window object is required for initialization pls suggest change
	onMount(() => {
		inputBox.focus();
	});
	afterUpdate(() => {
		scrollToBottom();
	});

	function fetchData() {
		remoteConfig.settings.minimumFetchIntervalMillis = 3600000; //settings should be in firebase.js but couldnt declare before page load
		remoteConfig.defaultConfig = {
			_bgClass: 'bgone'
		};
		const val = getValue(remoteConfig, '_bgClass');
		$changeClass = val._value; //change chat bg from firebase configs

		fetchAndActivate(remoteConfig).then(() => {
			$changeClass = getString(remoteConfig, '_bgClass');
			const val = getString(remoteConfig, 'jsonData'); //imported json as string
			if (val) {
				$jsonStore = JSON.parse(val); //converted string to json
			}
			console.log($jsonStore);
		});
	}

	function scrollToBottom() {
		if (messages) {
			chatbox.scrollTop = chatbox.scrollHeight;
		}
	}

	//functions
	async function logout() {
		signOut(auth)
			.then(() => {
				console.log('user signed out');
			})
			.catch((e) => {
				console.log(e);
			});
	}
	async function handleSubmit() {
		if ($textMsg != '') {
			const data = {
				email: $emailStore,
				message: $textMsg,
				createdAt: serverTimestamp()
			};
			await addDoc(collection(db, 'messages'), data);
			$textMsg = '';
		}
	}
	function handleKeydown(e) {
		if (e.key == 'Enter') {
			handleSubmit();
		}
	}

	let avatar = createAvatar(av_style, {
		size: 30
		// ... other options
	}).toDataUriSync();

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});
</script>

<div class={`chatBg ${$changeClass}`}>
	<button on:click={logout} class="chatLogout">
		<p>{$emailStore}</p>
		<FaSignOutAlt /></button
	>
	<div class="chatbox" bind:this={chatbox}>
		{#each messages as message}
			<div class={$emailStore === message.email ? 'av-right' : 'av-left'}>
				<div class={$emailStore === message.email ? 'msg-right' : 'msg-left'}>
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
