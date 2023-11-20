// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBSS8do1o98_B4OI2llbmLloauNF2ZEiUk",
  authDomain: "blog-project-deade.firebaseapp.com",
  projectId: "blog-project-deade",
  storageBucket: "blog-project-deade.appspot.com",
  messagingSenderId: "379625674922",
  appId: "1:379625674922:web:3fc1feb1c27cc68b10d8d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
