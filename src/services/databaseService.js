// src/services/databaseService.js
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "ASIzaSyAEUjdohp0RM6IarD9jOgu1yRb-QTNeKaQ",
  authDomain: "starship-9f7a4.firebaseapp.com",
  projectId: "starship-9f7a4",
  storageBucket: "starship-9f7a4.firebasestorage.app",
  messagingSenderId: "508935173311",
  appId: "1:508935173311:web:82f7a64a1c6f125b3e420a",
  measurementId: "G-PGTW49TQ8Q",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch all courses
export const getCourses = async () => {
  const coursesCollection = collection(db, "courses");
  const courseDocs = await getDocs(coursesCollection);

  return courseDocs.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Fetch index details by index number
export const getIndexDetails = async (index) => {
  const indexesCollection = collection(db, "indexes");
  const indexQuery = query(
    indexesCollection,
    where("index", "==", parseInt(index, 10))
  );
  const indexDocs = await getDocs(indexQuery);

  if (indexDocs.empty) {
    return null;
  }

  const indexData = indexDocs.docs[0].data();
  return {
    id: indexDocs.docs[0].id,
    ...indexData,
  };
};

// Search courses by code or name
export const searchCourses = async (searchQuery) => {
  const coursesCollection = collection(db, "courses");
  const searchQueryLowerCase = searchQuery.toLowerCase();

  const coursesSnapshot = await getDocs(coursesCollection);
  const matchingCourses = coursesSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (course) =>
        course.code.toLowerCase().includes(searchQueryLowerCase) ||
        course.name.toLowerCase().includes(searchQueryLowerCase)
    );

  return matchingCourses;
};
