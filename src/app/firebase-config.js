// firebase-config.js

import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
