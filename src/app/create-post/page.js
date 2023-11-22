'use client'
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useRouter } from "next/navigation";
import { UserAuth } from "../context/AuthContext";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Page = () => {
  const { isAuth } = UserAuth();
  const router = useRouter();
  const [value, setValue] = useState("");

  const postsCollectionRef = collection(db, "posts");

  const createPost = async () => {
    await addDoc(postsCollectionRef, {
      value,
      author: {
        name: auth.currentUser?.displayName || "Unknown",
        id: auth.currentUser?.uid || "Unknown",
      },
    });
    router.push("/");
  };

  // useEffect(() => {
  //   const redirectToLogin = () => {
  //     if (!isAuth) {
  //       router.push("/login");
  //     }
  //   };

  //   redirectToLogin();
  // }, [isAuth, router]);

  const quillModule = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className="flex max-w-[800px] mx-auto h-full flex-col justify-center items-center">
      <ReactQuill
        className="h-auto mt-16 rounded-full"
        theme="snow"
        value={value}
        onChange={setValue}
        modules={quillModule}
        formats={formats}
      />
      <button
        onClick={createPost}
        className="w-20 mt-16 rounded flex justify-center bg-gray-600 text-white py-4 px-20 text-center text-base cursor-pointer"
      >
        Save
      </button>
    </div>
  );
};

export default Page;
