import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBKJE7YlLeSqFISQ6QfqqDPlWubp2HEGQ",
  authDomain: "unique-notion-ai.firebaseapp.com",
  projectId: "unique-notion-ai",
  storageBucket: "unique-notion-ai.firebasestorage.app",
  messagingSenderId: "473375462460",
  appId: "1:473375462460:web:3a27b4f11021d98b4f5f39",
  measurementId: "G-282JGJX22N"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };