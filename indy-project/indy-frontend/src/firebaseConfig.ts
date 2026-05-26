import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBizyfalBHYdD8Wi_7BXCjjWhMZpLBi5lY",
  authDomain: "indy-wallet.firebaseapp.com",
  projectId: "indy-wallet",
  storageBucket: "indy-wallet.firebasestorage.app",
  messagingSenderId: "498762472853",
  appId: "1:498762472853:web:aa444a15249d370bda6a9c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
