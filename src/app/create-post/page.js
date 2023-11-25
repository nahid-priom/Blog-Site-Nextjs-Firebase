"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { addDoc, collection, doc, setDoc, serverTimestamp, Timestamp, increment, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useRouter } from "next/navigation";
import { UserAuth } from "../context/AuthContext";
import "react-quill/dist/quill.snow.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Page = () => {
  const { isAuth } = UserAuth();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  
  const postsCollectionRef = collection(db, "BlogPosts");
  const contentCollectionRef = collection(db, "Content");
  
  const createPost = async () => {
    const textContent = removeImageTags(value); // Extract text content without images
  
    // Create a new BlogPost document
    const blogPostRef = await addDoc(postsCollectionRef, {
      title: "My First Blog Post", // You can customize this
      authorId: auth.currentUser?.uid || "Unknown",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  
    // Split the text content into parts (text and images)
    const parts = textContent.split(/<img[^>]+src="([^">]+)"[^>]*>|(<[^>]+>)/g).filter(Boolean);
  
    // Get the current content count
    const contentQuery = query(contentCollectionRef, where("blogPostId", "==", blogPostRef.id));
    const contentSnapshot = await getDocs(contentQuery);
    const currentContentCount = contentSnapshot.size;
  
    // Add content to the Content subcollection
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
  
      if (part.startsWith("<img")) {
        // Handle image
        await addDoc(contentCollectionRef, {
          blogPostId: blogPostRef.id,
          contentType: "image",
          contentData: part,
          sequence: currentContentCount + i + 1,
          createdAt: serverTimestamp(),
        });
      } else {
        // Handle text
        await addDoc(contentCollectionRef, {
          blogPostId: blogPostRef.id,
          contentType: "text",
          contentData: part,
          sequence: currentContentCount + i + 1,
          createdAt: serverTimestamp(),
        });
      }
    }
  
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push("/");
    }, 3000);
  };
  
  
  
  const uploadImagesToStorage = async (quillValue, blogPostRef) => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const matches = quillValue.match(regex);
  
    if (!matches) {
      return [];
    }
  
    const storage = getStorage();
  
    const uploadPromises = matches.map(async (match, index) => {
      const imageUrl = match.replace(/<img[^>]+src="([^">]+)"/, '$1');
      const response = await fetch(imageUrl);
  
      // Handle base64-encoded images
      const isBase64 = imageUrl.startsWith('data:image');
      const imageBlob = isBase64 ? await response.blob() : await response.arrayBuffer();
  
      const imageRef = ref(storage, `images/${blogPostRef.id}/image${index + 1}.png`);
      await uploadBytes(imageRef, imageBlob);
      return getDownloadURL(imageRef);
    });
  
    return Promise.all(uploadPromises);
  };
  
  const removeImageTags = (quillValue) => {
    // Remove image tags from the quill content
    return quillValue.replace(/<img[^>]*src=["'][^"']*["'][^>]*>/g, '');
  };
  
  
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
      ["link", "image", "video"],
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
    "video",
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

      {showPopup && (
        <div className="popup">
          <p>Blog is shared!</p>
        </div>
      )}
    </div>
  );
};

export default Page;
