/**
 * श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - Firebase Configuration & Initialization
 */
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const USE_FIREBASE = true;

export const firebaseConfig = {
  apiKey: "AIzaSyDNEUSHQ8wqNn2KfRF7S0OAchXwq2V-G1g",
  authDomain: "shriram-plumbing.firebaseapp.com",
  projectId: "shriram-plumbing",
  storageBucket: "shriram-plumbing.firebasestorage.app",
  messagingSenderId: "297426173791",
  appId: "1:297426173791:web:fa06dc8d208969ed1e00ea",
  measurementId: "G-TMBY7JJFVN"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (safe for browser environments)
let analyticsInstance = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug("Firebase Analytics not supported in current environment", err);
  });
}

// Initialize Firestore & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = analyticsInstance;

export default app;
