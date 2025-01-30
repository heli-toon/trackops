// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChNq_M5V0r-kCycwbbWjcusxndAL2PZsA",
  authDomain: "trackops-1a1e8.firebaseapp.com",
  projectId: "trackops-1a1e8",
  storageBucket: "trackops-1a1e8.firebasestorage.app",
  messagingSenderId: "1057482010820",
  appId: "1:1057482010820:web:fe7ffdbf9b79bcbd4e9991",
  measurementId: "G-7KD5X6G8RQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);