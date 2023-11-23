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
  const postsCollectionRef = collection(db, "posts");

  const router = useRouter();
  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(postsCollectionRef);
      setPostLists(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPosts();
  }, [doc]);

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
    router.push("/");
  };
  return (
    <div className="w-full min-h-calc-viewport h-auto flex flex-col items-center pt-5">
      {postLists.map((post, index) => {
        return (
          <div
            className="w-[380px] md:w-[500px] xl:w-[650pxnah] h-auto max-h-[600px] bg-gray-200 shadow-md m-5 p-5 rounded"
            key={index}
          >
            <div className="w-full">
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-2xl my-4">{post.title}</h1>
                <div>
                  {isAuth && post.author.id === auth.currentUser.uid && (
                    <button
                      className="text-4xl"
                      onClick={() => {
                        deletePost(post.id);
                      }}
                    >
                      &#128465;
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="break-normal h-auto max-h-[400px] w-full overflow-hidden overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: post.value }} />
            </div>
            <h3 className="font-bold mt-4">@{post.author.name}</h3>
          </div>
        );
      })}
    </div>
  );
}
