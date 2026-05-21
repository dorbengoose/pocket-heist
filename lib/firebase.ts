import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsAY2d7hbyyYl8ZWG83Y7g8nedo4RTx7M",
  authDomain: "pocket-heist-website-f87be.firebaseapp.com",
  projectId: "pocket-heist-website-f87be",
  storageBucket: "pocket-heist-website-f87be.firebasestorage.app",
  messagingSenderId: "11157422579",
  appId: "1:11157422579:web:15a8ae5c137042ad695286",
  measurementId: "G-55VXLW10L9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
