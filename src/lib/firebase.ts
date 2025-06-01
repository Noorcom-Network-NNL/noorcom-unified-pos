
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA34fWoRGpdB5ye8CFK_vT4289WtAXED30",
  authDomain: "noorcompos-62899.firebaseapp.com",
  projectId: "noorcompos-62899",
  storageBucket: "noorcompos-62899.firebasestorage.app",
  messagingSenderId: "291453008812",
  appId: "1:291453008812:web:1b85b991be12a4cfdc1809"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
