import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC8aK1_rY1bBGeHjbEChIjpi6Yv8VTeDL0",
  authDomain: "learn-ai-a5638.firebaseapp.com",
  projectId: "learn-ai-a5638",
  storageBucket: "learn-ai-a5638.firebasestorage.app",
  messagingSenderId: "712188207825",
  appId: "1:712188207825:web:102f1cb2cb49d73809dbf0",
  measurementId: "G-FF2CZSXCLD",
  databaseURL: "https://learn-ai-a5638-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
