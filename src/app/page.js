"use client";
import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase-config";
import { UserAuth } from "./context/AuthContext";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuth } = UserAuth();
  const [postLists, setPostLists] = useState([]);
  const [contentData, setContentData] = useState([]);
  
  const postsCollectionRef = collection(db, "BlogPosts");
  const contentCollectionRef = collection(db, "Content");

  const router = useRouter();

  useEffect(() => {
    const getPosts = async () => {
      // Fetch data from BlogPosts collection
      const postsData = await getDocs(postsCollectionRef);
      setPostLists(postsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      // Fetch data from Content collection
      const contentData = await getDocs(contentCollectionRef);
      setContentData(contentData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getPosts();
  }, [doc]);

  const deletePost = async (id) => {
    const postDoc = doc(db, "BlogPosts", id);
    await deleteDoc(postDoc);
    router.push("/");
  };

  return (
    <div className="w-full min-h-calc-viewport h-auto flex flex-col items-center pt-5">
      {contentData.map((content, index) => {
        return (
          <div
            className="w-[380px] md:w-[500px] xl:w-[650px] h-auto max-h-[600px] bg-gray-200 shadow-md m-5 p-5 rounded"
            key={index}
          >
            {/* Adjust rendering based on the structure of your content documents */}
            <div
              className="break-normal h-auto max-h-[400px] w-full overflow-hidden overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content.contentData }}
            />
          </div>
        );
      })}
    </div>
  );
}