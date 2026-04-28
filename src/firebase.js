import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // ✅ ADDED

const firebaseConfig = {
  apiKey: "AIzaSyDe72wloChT1nOQ0hprZfjk2JtZzMm2zbg",
  authDomain: "sewa-493510.firebaseapp.com",
  projectId: "sewa-493510",
  storageBucket: "sewa-493510.appspot.com",
  messagingSenderId: "335158139681",
  appId: "1:335158139681:web:02b7799a2b109d16f47c60"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅ ADDED

export default app;