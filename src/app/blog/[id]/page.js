// pages/blog/[id].js
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

const SingleBlogPost = () => {
  const router = useRouter();
  const id = "UQEZoySseWngpA8dW1yz";
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id) {
          const postDocRef = doc(db, "BlogPosts", id);
          const postDoc = await getDoc(postDocRef);

          if (postDoc.exists()) {
            setPost({ id: postDoc.id, ...postDoc.data() });
          } else {
            console.log("Post not found");
            // Handle post not found
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        // Handle error (e.g., show an error message)
      }
    };

    fetchPost();
  }, [id]);

  if (!post) {
    // Handle loading state or post not found
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.contentData}</p>
      {/* Add other post details as needed */}
    </div>
  );
};

export default SingleBlogPost;
