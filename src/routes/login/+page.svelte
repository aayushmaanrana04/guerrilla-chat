<script>
	import { auth, provider } from '$lib/firebase';
	import IoLogoGoogle from 'svelte-icons/io/IoLogoGoogle.svelte';
	import { signInWithPopup } from 'firebase/auth';

	async function login() {
		try {
			await signInWithPopup(auth, provider);
		} catch (e) {
			console.log(e);
		}
	}
</script>

<section>
	<button class="loginwithgoogle" on:click={login}
		>Login with Google <div class="googlelogo">
			<IoLogoGoogle />
		</div>
	</button>
</section>
