// pages/blog/[id].js
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import DOMPurify from "dompurify";

const SingleBlogPost = () => {
  const { id } = useParams();

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
    return <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">Loading...</div>;
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
          <p className="text-base font-bold pr-2">
            {post.authorName}
          </p>
          <p className="text-sm text-gray-900">
            {post.createdAt.toDate().toLocaleString()}
          </p>

        </div>
          <p className="ml-2">
             5 min read 
          </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      {/* Add other post details as needed */}
    </div>
  );
};

export default SingleBlogPost;
