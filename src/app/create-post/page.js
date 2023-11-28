"use client";
import { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const Page = () => {
  const [value, setValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const router = useRouter();
  const createPost = async () => {
    // Use the Quill content from state
    let quillValue = value;

    const postsCollectionRef = collection(db, "BlogPosts");
    // Replace base64-encoded images with URLs
    quillValue = await replaceBase64Images(quillValue);

    // Remove <p> tags around images
    quillValue = quillValue
      .replace(/<p><img/g, "<img")
      .replace(/><\/p>/g, "/>");

    // Create a new BlogPost document
    await addDoc(collection(db, "BlogPosts"), {
      title: "My First Blog Post", // You can customize this
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

        // Generate a unique identifier for the image reference
        const uniqueIdentifier = Date.now(); // You can use any method to generate a unique identifier
        const imageRef = ref(
          storage,
          `images/temp_image_${uniqueIdentifier}_${i + 1}.png`
        );

        await uploadBytes(imageRef, imageBlob);

        // Replace base64-encoded image with the download URL
        quillValue = quillValue.replace(
          match,
          `<img src="${await getDownloadURL(imageRef)}" alt="${imageAlt}"`
        );
      }
    }

    return quillValue;
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageAlt("");
    setShowPopup(true);
  };
  const handleUpdateAlt = () => {
    if (selectedImage) {
      // Update value with the alt text and image URL
      setValue((prevValue) =>
        replaceBase64Images(prevValue, selectedImage, imageAlt)
      );
    }

    setSelectedImage(null);
    setImageAlt("");
    setShowPopup(false);
  };
  useEffect(() => {
    const quillEditor = document.querySelector(".ql-editor");

    if (quillEditor) {
      quillEditor.addEventListener("click", handleImageClick);
    }

    return () => {
      if (quillEditor) {
        quillEditor.removeEventListener("click", handleImageClick);
      }
    };
  }, [handleImageClick]);
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
    clipboard: {
      matchVisual: false,
    },
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
    <div className="flex relative max-w-[800px] mx-auto h-full flex-col justify-center items-center">
      <ReactQuill
        className="h-auto mt-16 rounded-full"
        theme="snow"
        value={value}
        onChange={setValue}
        modules={quillModule}
        formats={formats}
        Add a custom handler for image clicks
        onClick={(event) => {
          if (event.target.tagName === "IMG") {
            handleImageClick(event.target.src);
          }
        }}
      />
      <button
        onClick={createPost}
        className="w-20 mt-16 rounded flex justify-center bg-gray-600 text-white py-4 px-20 text-center text-base cursor-pointer"
      >
        Save
      </button>

      {showPopup && (
        <div className="bg-gray-200 rounded absolute h-20 flex justify-center items-center py-4 px-4">
          {/* Input for alt text */}
          <input
            type="text"
            placeholder="Enter alt text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="py-1 px-2 rounded"
          />
          <div className="px-2">
            {/* Button to update alt text */}
            <button className="bg-black text-white px-1 py-1 rounded text-sm mr-2" onClick={handleUpdateAlt}>Update</button>
            {/* Close button */}
            <button className="bg-black text-white px-1 py-1 rounded text-sm " onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
