"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import DOMPurify from "dompurify";

const SingleBlogPost = () => {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [readingTimeState, setReadingTimeState] = useState(5);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id) {
          const postDocRef = doc(db, "BlogPosts", id);
          const postDoc = await getDoc(postDocRef);

          if (postDoc.exists()) {
            const postData = { id: postDoc.id, ...postDoc.data() };
            setPost(postData);
          } else {
            console.log("Post not found");
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [id]);
  useEffect(() => {
    const handleScroll = () => {
      const postContentElement = document.getElementById("post-content");

      if (postContentElement) {
        const scrollPosition = window.scrollY;
        const postHeight = postContentElement.offsetHeight;
        const windowHeight = window.innerHeight;

        const scrollPercentage =
          (scrollPosition / (postHeight - windowHeight)) * 100;

        setIsReading(scrollPercentage < 100);
      }
    };

    const updateReadingTimeInFirestore = async (updatedReadingTime) => {
      try {
        const postDocRef = doc(db, "BlogPosts", id);

        await updateDoc(postDocRef, {
          readingTime: updatedReadingTime,
        });

        console.log("Reading time updated for post with ID:", id);
      } catch (error) {
        console.error("Error updating reading time:", error);
      }
    };

    const updateReadingTime = async () => {
      try {
        const postDocRef = doc(db, "BlogPosts", id);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          const previousReadingTime = postDoc.data().readingTime || 0;

          if (isReading && id) {
            const increment = 0.16;
            setReadingTimeState(
              (prevReadingTime) => prevReadingTime + increment
            );

            updateReadingTimeInFirestore(previousReadingTime + increment);
          }
        } else {
          console.log("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post or updating reading time:", error);
      }
    };

    const intervalId = setInterval(updateReadingTime, 10000);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(intervalId);
    };
  }, [isReading, id, post]);
  if (!post) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
        Loading...
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(post.contentData);

  return (
    <div className="max-w-[680px] md:mx-auto my-6 md:my-12 mx-4">
      <h1 className="text-2xl md:text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-end pt-2 pb-4">
        <img
          src={post.profilePictureURL}
          alt="Profile Picture"
          className="w-12 h-12 rounded-full mr-2"
        />
        <div className="flex flex-col items-baseline">
          <p className="text-base font-bold pr-2">{post.authorName}</p>
          <p className="text-sm text-gray-900">
            {post.createdAt.toDate().toLocaleString()}
          </p>
        </div>
        <p id="post-content" className="ml-2">
          {Math.ceil(post.readingTime)} min read
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};

export default SingleBlogPost;
