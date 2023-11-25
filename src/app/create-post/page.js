"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useRouter } from "next/navigation";
import { UserAuth } from "../context/AuthContext";
import "react-quill/dist/quill.snow.css";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Page = () => {
  const { isAuth } = UserAuth();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State for the popup visibility

  const postsCollectionRef = collection(db, "posts");

  const createPost = async () => {
    const imageUrls = extractImageUrls(value);
    const textContent = removeImageTags(value);

    // Upload images to Firebase Storage
    const uploadedImageUrls = await uploadImagesToStorage(imageUrls);

    // Add post to Firestore with image download URLs and without the image data in "text"
    await addDoc(postsCollectionRef, {
      content: {
        text: textContent,
        images: uploadedImageUrls,
      },
      author: {
        name: auth.currentUser?.displayName || "Unknown",
        id: auth.currentUser?.uid || "Unknown",
      },
    });

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push("/");
    }, 3000);
  };

  const extractImageUrls = (quillValue) => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const matches = quillValue.match(regex);
    return matches ? matches.map(match => match.replace(/<img[^>]+src="([^">]+)"/, '$1')) : [];
  };

  const removeImageTags = (quillValue) => {
    // Remove image tags from the quill content
    return quillValue.replace(/<img[^>]*src=["'][^"']*["'][^>]*>/g, '');
  };

  const uploadImagesToStorage = async (imageUrls) => {
    const storage = getStorage();

    const uploadPromises = imageUrls.map(async (imageUrl, index) => {
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      const imageRef = ref(storage, `images/image${index + 1}.png`);
      await uploadBytes(imageRef, imageBlob);
      return getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
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
      ["link", "image", "video"], // Add video option
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
    "video", // Add video format
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

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <p>Blog is shared!</p>
        </div>
      )}
    </div>
  );
};

export default Page;
