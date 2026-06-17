import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ban-alhaidari-energy.firebaseapp.com",
  projectId: "ban-alhaidari-energy",
  storageBucket: "ban-alhaidari-energy.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// DEBUG — shows first 8 chars of apiKey so you can verify it starts with "AIzaSy"
console.log("[Firebase] apiKey preview:", import.meta.env.VITE_FIREBASE_API_KEY
  ? String(import.meta.env.VITE_FIREBASE_API_KEY).slice(0, 10) + "..."
  : "MISSING");

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("[Firebase] initialized successfully ✓");
} catch (err) {
  console.error("[Firebase] init failed:", err);
}

export { app, db, auth };
export default app;
