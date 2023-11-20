"use client";
import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useRouter } from "next/navigation";
import { UserAuth } from "../context/AuthContext";

const Page = () => {
  const { isAuth } = UserAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");

  const postsCollectionRef = collection(db, "posts");
  const createPost = async () => {
    await addDoc(postsCollectionRef, {
      title,
      postText,
      author: { name: auth.currentUser.displayName, id: auth.currentUser.uid },
    });
    router.push("/");
  };
  useEffect (() => {
    if(!isAuth) {
      router.push('/login')
    }
  })
  return (
    <div className="w-full min-h-calc-viewport grid place-items-center">
      <div className="w-[500px] h-auto p-5 bg-gray-600 rounded-md text-white flex flex-col">
        <h1 className="text-center text-3xl font-bold">Create A Post</h1>
        <div className="mt-7 flex flex-col">
          <label className="text-2xl mb-2">Title</label>
          <input
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            className="text-black h-10 text-base rounded-md p-2"
            placeholder="Enter title"
          />
        </div>
        <div className="mt-7 flex flex-col">
          <label className="text-2xl mb-2">Post</label>
          <textarea
            className="h-[250px] text-black text-base rounded-md p-2"
            placeholder="Enter your post"
            onChange={(event) => {
              setPostText(event.target.value);
            }}
          />
        </div>
        <button onClick={createPost} className="mt-5 h-10 border rounded cursor-pointer text-xl">
          Submit Post
        </button>
      </div>
    </div>
  );
};

export default Page;
