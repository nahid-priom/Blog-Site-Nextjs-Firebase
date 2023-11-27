"use client";
import { useState } from "react";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const Page = () => {
  const [value, setValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const createPost = async () => {
    // Use the Quill content from state
    let quillValue = value;

    const postsCollectionRef = collection(db, "BlogPosts");
    // Replace base64-encoded images with URLs
    quillValue = await replaceBase64Images(quillValue);

    // Create a new BlogPost document
    await addDoc(collection(db, "BlogPosts"), {
        title: "My First Blog Post",
        authorId: auth.currentUser?.uid || "Unknown",
        contentData: quillValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push("/");
    }, 3000);
  };

  const replaceBase64Images = async (quillValue) => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const matches = quillValue.match(regex);

    if (!matches) {
      return quillValue;
    }

    const storage = getStorage();

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const imageUrl = match.replace(/<img[^>]+src="([^">]+)"/, "$1");

      if (imageUrl.startsWith("data:image")) {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();

        const imageRef = ref(storage, `images/temp_image${i + 1}.png`);
        await uploadBytes(imageRef, imageBlob);

        // Replace base64-encoded image with the download URL
        quillValue = quillValue.replace(
          match,
          `<img src="${await getDownloadURL(imageRef)}" alt="image-description"`
        );
      }
    }

    return quillValue;
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

      {showPopup && (
        <div className="popup">
          <p>Blog is shared!</p>
        </div>
      )}
    </div>
  );
};

export default Page;
