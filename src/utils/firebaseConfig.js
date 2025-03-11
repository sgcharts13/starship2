import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEUjdohp0RM6IarD9jOgu1yRb-QTNeKaQ",
  authDomain: "starship-9f7a4.firebaseapp.com",
  projectId: "starship-9f7a4",
  storageBucket: "starship-9f7a4.firebasestorage.app",
  messagingSenderId: "508935173311",
  appId: "1:508935173311:web:82f7a64a1c6f125b3e420a",
  measurementId: "G-PGTW49TQ8Q",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
