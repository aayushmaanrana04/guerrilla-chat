import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyA8pn61tKvwg2GeYjiKS2J8vPAUANAfAUY',
	authDomain: 'guerrilla-chat.firebaseapp.com',
	projectId: 'guerrilla-chat',
	storageBucket: 'guerrilla-chat.appspot.com',
	messagingSenderId: '471301721052',
	appId: '1:471301721052:web:d787a886926da0ef459d19',
	measurementId: 'G-BX578KKMNX'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
