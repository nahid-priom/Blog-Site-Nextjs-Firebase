// utils/useFetchPost.js
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const getPostData = (id) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(error.message || "Error fetching post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return { post, loading, error };
};

export default getPostData;
