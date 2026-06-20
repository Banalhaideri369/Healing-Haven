import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_Pdi5xvzp1JTjj9eGxBZDWiThlB2Gge4",
  authDomain: "ban-alhaidari-energy.firebaseapp.com",
  projectId: "ban-alhaidari-energy",
  storageBucket: "ban-alhaidari-energy.firebasestorage.app",
  messagingSenderId: "320540496120",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:320540496120:web:1ec287ae83272a558c2b0d",
  measurementId: "G-CQS0G9GQ0L",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("[Firebase Auth] initialized ✓");
} catch (err) {
  console.error("[Firebase] init failed:", err);
}

export { app, auth };
export default app;
