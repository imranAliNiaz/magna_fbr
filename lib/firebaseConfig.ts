import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvuEFZZeQY_VqJBIjYuHwt0vOr5xQRk5I",
  authDomain: "magna-fbr.firebaseapp.com",
  projectId: "magna-fbr",
  storageBucket: "magna-fbr.firebasestorage.app",
  messagingSenderId: "506263025173",
  appId: "1:506263025173:web:489c810729840f066a401c",
  measurementId: "G-FK16CH2V3W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
