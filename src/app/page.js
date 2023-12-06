"use client";
import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase-config";
import Link from "next/link";

export default function Home() {
  const [postLists, setPostLists] = useState([]);

  const postsCollectionRef = collection(db, "BlogPosts");

  useEffect(() => {
    const getPosts = async () => {
      const postsData = await getDocs(postsCollectionRef);
      setPostLists(
        postsData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    getPosts();
  }, []);

  function extractParagraph(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    const paragraphs = doc.querySelectorAll("p");

    if (paragraphs.length > 0) {
      return paragraphs[0].textContent;
    }

    return "";
  }

  function truncateText(text, numWords) {
    const words = text.split(" ");
    const truncatedText = words.slice(0, numWords).join(" ");
    return truncatedText + (words.length > numWords ? "..." : "");
  }

  function extractImageUrl(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    const imageElement = doc.querySelector("img");
    return imageElement ? imageElement.src : null;
  }

  return (
    <div className="max-w-[680px] mx-auto mt-4 md:mt-12">
      {postLists.map((post) => (
        <div
          key={post.id}
          className="bg-white border-b border-gray-200 p-4 mb-4"
        >
          <div className="flex items-center">
            <img
              src={post.profilePictureURL}
              alt="Profile Picture"
              className="w-6 h-6 rounded-full mr-2"
            />
            <p className="text-xs md:text-sm font-bold pr-2 border-r-2 border-gray-500">
              {post.authorName}
            </p>
            <p className="text-xs md:text-sm text-gray-900 pl-2">
              {post.createdAt.toDate().toLocaleString()}
            </p>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-3/4 pr-4">
              <Link href="/blog/:[id]" as={`/blog/${post.id}`}>
                <h2 className=" text-base md:text-xl py-2 font-semibold">
                  {post.title}
                </h2>
              </Link>

              {post.contentData && (
                <p className="text-xs md:text-base text-gray-500">
                  {truncateText(extractParagraph(post.contentData), 20)}
                </p>
              )}
            </div>

            {post.contentData && (
              <div className="w-40 h-auto">
                <img
                  src={extractImageUrl(post.contentData)}
                  alt="Post Image"
                  className="w-[112px] h-auto rounded"
                />
              </div>
            )}
          </div>
          <p className="flex justify-start pt-8 pb-4 items-center">
            5 min read
          </p>
        </div>
      ))}
    </div>
  );
}
