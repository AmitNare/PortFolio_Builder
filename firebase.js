// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr-AzF4YPClgvCPZP7-hAEpfi9crKajP4",
  authDomain: "portfolio-builder-3e3a8.firebaseapp.com",
  databaseURL: "https://portfolio-builder-3e3a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-builder-3e3a8",
  storageBucket: "portfolio-builder-3e3a8.appspot.com",
  messagingSenderId: "693861171028",
  appId: "1:693861171028:web:61fc709e936e4c9e8cd2c1",
  measurementId: "G-K1VK9F0H13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = getDatabase(app)
const storage = getStorage(app);


export { app, analytics, auth, db, storage }; // Export db here