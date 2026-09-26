import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqn59Wk1nkUBCZVYNL-aBRIvMTs-je1vw",
  authDomain: "hathax-contable.firebaseapp.com",
  projectId: "hathax-contable",
  storageBucket: "hathax-contable.firebasestorage.app",
  messagingSenderId: "607378284941",
  appId: "1:607378284941:web:9fbd032c1bc919a200ddc4"
};

// Initialize Firebase (solo si no se ha inicializado antes)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
