import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- ACTION REQUIRED ---
// 1. Go to Firebase Console -> Project Settings
// 2. Scroll to "Your apps" -> SDK Setup and Configuration
// 3. Copy the 'firebaseConfig' object and paste it below replacing the placeholder
const firebaseConfig = {
   apiKey: "AIzaSyB93qy8JJfg8ZD5eNzsY8bC47URAncWxFU",
  authDomain: "donation-of-food.firebaseapp.com",
  projectId: "donation-of-food",
  storageBucket: "donation-of-food.firebasestorage.app",
  messagingSenderId: "395208031194",
  appId: "1:395208031194:web:d06e39c907b7e62a9a1ee3",
  measurementId: "G-PTJCBBWGB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);